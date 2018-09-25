import MovePanelItemCmd from '../commands/MovePanelItemCmd';
import AddDeleteDocElementCmd from '../commands/AddDeleteDocElementCmd';
import SetValueCmd from '../commands/SetValueCmd';
import Band from '../container/Band';
import Parameter from '../data/Parameter';
import * as utils from '../utils';

/**
 * Base class for all doc elements.
 * @class
 */
export default class DocElement {
    constructor(name, id, defaultWidth, defaultHeight, rb) {
        this.rb = rb;
        this.id = id;
        this.name = name;
        this.panelItem = null;
        this.x = '0';
        this.y = '0';
        this.width = '' + defaultWidth;
        this.height = '' + defaultHeight;
        this.containerId = null;
        // in case of frame or band element, this is the container represented by the element
        this.linkedContainerId = null;
        this.printIf = '';
        this.removeEmptyElement = false;

        this.el = null;
        this.selected = false;

        this.xVal = 0;
        this.yVal = 0;
        this.widthVal = 0;
        this.heightVal = 0;

        this.errors = [];
    }

    setInitialData(initialData) {
        for (let key in initialData) {
            if (initialData.hasOwnProperty(key) && this.hasOwnProperty(key)) {
                this[key] = initialData[key];
            }
        }

        // make sure x, y, width and height are strings (they are stored as numbers when serialized)
        this.x = '' + this.x;
        this.y = '' + this.y;
        this.width = '' + this.width;
        this.height = '' + this.height;
        
        this.xVal = utils.convertInputToNumber(this.x);
        this.yVal = utils.convertInputToNumber(this.y);
        this.widthVal = utils.convertInputToNumber(this.width);
        this.heightVal = utils.convertInputToNumber(this.height);
    }

    /**
     * Called after initialization is finished.
     */
    setup(openPanelItem) {
        let container = this.getContainer();
        if (container !== null) {
            // adapt position if new element is outside container
            let containerSize = container.getContentSize();
            if (this.xVal + this.widthVal > containerSize.width) {
                this.xVal = containerSize.width - this.widthVal;
            }
            if (this.xVal < 0) {
                this.xVal = 0;
            }
            if (this.yVal + this.heightVal > containerSize.height) {
                this.yVal = containerSize.height - this.heightVal;
            }
            if (this.yVal < 0) {
                this.yVal = 0;
            }
            this.x = '' + this.xVal;
            this.y = '' + this.yVal;
        }
    }

    /**
     * Register event handlers so element can be selected, dragged and resized.
     */
    registerEventHandlers() {
        this.el
            .dblclick(event => {
                this.handleClick(event, true);
            })
            .mousedown(event => {
                this.handleClick(event, false);
            });
    }

    /**
     * Handle mouse click on this element so the element can be selected, dragged and resized.
     * @param {jQuery.Event} event - browser event object.
     * @param {Boolean} ignoreSelectedContainer - if true the element will always be selected in case it
     * was not selected before. Otherwise the element will only be selected if it's container is
     * not selected (e.g. the frame container when this element is inside a frame).
     */
    handleClick(event, ignoreSelectedContainer) {
        if (!this.rb.isSelectedObject(this.id)) {
            if (ignoreSelectedContainer || !this.isContainerSelected()) {
                let allowSelection = true;
                if (event.shiftKey) {
                    // do not allow selecting element if one of its children is already selected
                    let children = [];
                    this.appendContainerChildren(children);
                    for (let child of children) {
                        if (this.rb.isSelectedObject(child.getId())) {
                            allowSelection = false;
                            break;
                        }
                    }
                }
                if (allowSelection) {
                    this.rb.selectObject(this.id, !event.shiftKey);
                }
                event.stopPropagation();
            }
        } else {
            if (event.shiftKey) {
                this.rb.deselectObject(this.id);
            } else {
                this.rb.getDocument().startDrag(event.originalEvent.pageX, event.originalEvent.pageY,
                    this.id, this.containerId, this.linkedContainerId,
                    this.getElementType(), DocElement.dragType.element);
            }
            event.stopPropagation();
        }
    }

    getId() {
        return this.id;
    }

    /**
     * Returns highest id of this component including all its child components.
     * @returns {Number}
     */
    getMaxId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getPanelItem() {
        return this.panelItem;
    }

    setPanelItem(panelItem) {
        this.panelItem = panelItem;
    }

    getContainerId() {
        return this.containerId;
    }

    getContainer() {
        return this.rb.getDataObject(this.getContainerId());
    }

    getLinkedContainer() {
        if (this.linkedContainerId !== null) {
            return this.rb.getDataObject(this.linkedContainerId);
        }
        return null;
    }

    getContainerContentSize() {
        let container = this.getContainer();
        return (container !== null) ? container.getContentSize() : { width: 0, height: 0 };
    }

    appendToContainer() {
        let container = this.getContainer();
        if (container !== null) {
            container.appendElement(this.el);
        }
    }

    isContainerSelected() {
        let container = this.getContainer();
        if (container !== null) {
            return container.isSelected();
        }
        return false;
    }

    appendContainerChildren(elements) {
        if (this.linkedContainerId !== null) {
            if (this.panelItem !== null) {
                let children = this.panelItem.getChildren();
                for (let child of children) {
                    if (child.getData() instanceof DocElement) {
                        elements.push(child.getData());
                        child.getData().appendContainerChildren(elements);
                    }
                }
            }
        }
    }

    /**
     * Returns absolute position inside document.
     * @returns {Object} x and y coordinates.
     */
    getAbsolutePosition() {
        let pos = { x: this.xVal, y: this.yVal };
        let container = this.getContainer();
        if (container !== null) {
            let offset = container.getOffset();
            pos.x += offset.x;
            pos.y += offset.y;
        }
        return pos;
    }

    /**
     * Check element bounds within container and adapt position/size if necessary.
     *
     * This should be called when an element is resized or moved to another container to guarantee that
     * the element is not out of bounds.
     * @param {Number} x - x value of doc element.
     * @param {Number} y - y value of doc element.
     * @param {Number} width - width value of doc element.
     * @param {Number} height - height value of doc element.
     * @param {Object} containerSize - width and height of container where this doc element belongs to.
     * @param {CommandGroupCmd} cmdGroup - possible SetValue commands will be added to this command group.
     */
    checkBounds(x, y, width, height, containerSize, cmdGroup) {
        if ((x + width) > containerSize.width) {
            x = containerSize.width - width;
        }
        if (x < 0)  {
            x = 0;
        }
        if ((x + width) > containerSize.width) {
            width = containerSize.width - x;
        }
        if ((y + height) > containerSize.height) {
            y = containerSize.height - height;
        }
        if (y < 0)  {
            y = 0;
        }
        if ((y + height) > containerSize.height) {
            height = containerSize.height - y;
        }

        if (x !== this.xVal && this.getXTagId() !== '') {
            let cmd = new SetValueCmd(this.id, this.getXTagId(), 'x',
                '' + x, SetValueCmd.type.text, this.rb);
            cmd.disableSelect();
            cmdGroup.addCommand(cmd);
        }
        if (y !== this.yVal && this.getYTagId() !== '') {
            let cmd = new SetValueCmd(this.id, this.getYTagId(), 'y',
                '' + y, SetValueCmd.type.text, this.rb);
            cmd.disableSelect();
            cmdGroup.addCommand(cmd);
        }
        if (width !== this.widthVal && this.getWidthTagId() !== '') {
            let cmd = new SetValueCmd(this.id, this.getWidthTagId(), 'width',
                '' + width, SetValueCmd.type.text, this.rb);
            cmd.disableSelect();
            cmdGroup.addCommand(cmd);
        }
        if (height !== this.heightVal && this.getHeightTagId() !== '') {
            let cmd = new SetValueCmd(this.id, this.getHeightTagId(), 'height',
                '' + height, SetValueCmd.type.text, this.rb);
            cmd.disableSelect();
            cmdGroup.addCommand(cmd);
        }

        let linkedContainer = this.getLinkedContainer();
        if (linkedContainer !== null && linkedContainer.getPanelItem() !== null) {
            let linkedContainerSize = { width: width, height: height };
            for (let child of linkedContainer.getPanelItem().getChildren()) {
                if (child.getData() instanceof DocElement) {
                    let docElement = child.getData();
                    docElement.checkBounds(docElement.getValue('xVal'), docElement.getValue('yVal'),
                        docElement.getValue('widthVal'), docElement.getValue('heightVal'),
                        linkedContainerSize, cmdGroup);
                }
            }
        }
    }

    getValue(field) {
        return this[field];
    }

    setValue(field, value, elSelector, isShown) {
        this[field] = value;
        if (field === 'x' || field === 'y' || field === 'width' || field === 'height') {
            this[field + 'Val'] = utils.convertInputToNumber(value);
            this.updateDisplay();
        } else if (field === 'containerId') {
            if (this.el !== null) {
                // detach dom node from container and then attach it to new container
                this.el.detach();
                this.appendToContainer();
            }
            if (this.linkedContainerId !== null) {
                let linkedContainer = this.getLinkedContainer();
                if (linkedContainer !== null) {
                    linkedContainer.setParent(this.getContainer());
                }
            }
        } else if (['styleId', 'bold', 'italic', 'underline', 'horizontalAlignment', 'verticalAlignment',
                'textColor', 'backgroundColor', 'font', 'fontSize', 'lineSpacing', 'borderColor', 'borderWidth',
                'borderAll', 'borderLeft', 'borderTop', 'borderRight', 'borderBottom',
                'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom'].indexOf(field) !== -1) {

            this.updateStyle();

            if (['borderWidth', 'borderAll', 'borderLeft', 'borderTop', 'borderRight', 'borderBottom',
                'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom'].indexOf(field) !== -1) {
                this.updateDisplay();
            }
        }
    }

    /**
     * Returns all data fields of this object. The fields are used when serializing the object.
     * @returns {String[]}
     */
    getFields() {
        return [];
    }

    getElementType() {
        return DocElement.type.none;
    }

    setBorderAll(fieldPrefix, value) {
        this[fieldPrefix + 'borderAll'] = value;
    }

    updateDisplay() {
        this.updateDisplayInternal(this.xVal, this.yVal, this.widthVal, this.heightVal);
    }

    updateDisplayInternal(x, y, width, height) {
        if (this.el !== null) {
            let props = { left: this.rb.toPixel(x), top: this.rb.toPixel(y),
                width: this.rb.toPixel(width), height: this.rb.toPixel(height) };
            this.el.css(props);
        }
    }

    updateStyle() {
    }

    updateChangedStyle(styleId) {
        if (this.styleId === styleId) {
            this.updateStyle();
        }
    }

    getDragDiff(diffX, diffY, dragType, gridSize) {
        let rv = { x: 0, y: 0 };
        let dragX, dragY;
        let posX1 = this.xVal;
        let posY1 = this.yVal;
        let posX2 = posX1 + this.widthVal;
        let posY2 = posY1 + this.heightVal;
        let maxWidth = this.getMaxWidth();
        const MIN_DRAG_SIZE = 20;
        if (dragType === DocElement.dragType.element) {
            dragX = posX1 + diffX;
            if (gridSize !== 0) {
                dragX = utils.roundValueToInterval(dragX, gridSize);
            }
            dragY = posY1 + diffY;
            if (gridSize !== 0) {
                dragY = utils.roundValueToInterval(dragY, gridSize);
            }
            rv.x = dragX - posX1;
            rv.y = dragY - posY1;
        } else {
            let containerSize = this.getContainerContentSize();
            if (dragType === DocElement.dragType.sizerNW || dragType === DocElement.dragType.sizerN || dragType === DocElement.dragType.sizerNE) {
                dragY = posY1 + diffY;
                if (gridSize !== 0) {
                    dragY = utils.roundValueToInterval(dragY, gridSize);
                }
                if (dragY > posY2 - MIN_DRAG_SIZE) {
                    if (gridSize !== 0) {
                        dragY = utils.roundValueToLowerInterval(posY2 - MIN_DRAG_SIZE, gridSize);
                    } else {
                        dragY = posY2 - MIN_DRAG_SIZE;
                    }
                } else if (dragY < 0) {
                    dragY = 0;
                }
                rv.y = dragY - posY1;
            }
            if (dragType === DocElement.dragType.sizerNE || dragType === DocElement.dragType.sizerE || dragType === DocElement.dragType.sizerSE) {
                dragX = posX2 + diffX;
                if (gridSize !== 0) {
                    dragX = utils.roundValueToInterval(dragX, gridSize);
                }
                if (dragX < posX1 + MIN_DRAG_SIZE) {
                    if (gridSize !== 0) {
                        dragX = utils.roundValueToUpperInterval(posX1 + MIN_DRAG_SIZE, gridSize);
                    } else {
                        dragX = posX1 + MIN_DRAG_SIZE;
                    }
                } else if (dragX > maxWidth) {
                    dragX = maxWidth;
                }
                rv.x = dragX - posX2;
            }
            if (dragType === DocElement.dragType.sizerSE || dragType === DocElement.dragType.sizerS || dragType === DocElement.dragType.sizerSW) {
                dragY = posY2 + diffY;
                if (gridSize !== 0) {
                    dragY = utils.roundValueToInterval(dragY, gridSize);
                }
                if (dragY < posY1 + MIN_DRAG_SIZE) {
                    if (gridSize !== 0) {
                        dragY = utils.roundValueToUpperInterval(posY1 + MIN_DRAG_SIZE, gridSize);
                    } else {
                        dragY = posY1 + MIN_DRAG_SIZE;
                    }
                } else if (dragY > containerSize.height) {
                    dragY = containerSize.height;
                }
                rv.y = dragY - posY2;
            }
            if (dragType === DocElement.dragType.sizerSW || dragType === DocElement.dragType.sizerW || dragType === DocElement.dragType.sizerNW) {
                dragX = posX1 + diffX;
                if (gridSize !== 0) {
                    dragX = utils.roundValueToInterval(dragX, gridSize);
                }
                if (dragX > posX2 - MIN_DRAG_SIZE) {
                    if (gridSize !== 0) {
                        dragX = utils.roundValueToLowerInterval(posX2 - MIN_DRAG_SIZE, gridSize);
                    } else {
                        dragX = posX2 - MIN_DRAG_SIZE;
                    }
                } else if (dragX < 0) {
                    dragX = 0;
                }
                rv.x = dragX - posX1;
            }
        }
        return rv;
    }

    updateDrag(diffX, diffY, dragType, dragContainer, cmdGroup) {
        let posX1 = this.xVal;
        let posY1 = this.yVal;
        let posX2 = posX1 + this.widthVal;
        let posY2 = posY1 + this.heightVal;
        let maxWidth = this.getMaxWidth();
        let containerSize = this.getContainerContentSize();
        if (dragType === DocElement.dragType.element) {
            posX1 += diffX;
            posX2 = posX1 + this.widthVal;
            posY1 += diffY;
            posY2 = posY1 + this.heightVal;
        } else {
            if (dragType === DocElement.dragType.sizerNW || dragType === DocElement.dragType.sizerN ||
                dragType === DocElement.dragType.sizerNE) {
                posY1 += diffY;
            }
            if (dragType === DocElement.dragType.sizerNE || dragType === DocElement.dragType.sizerE ||
                dragType === DocElement.dragType.sizerSE) {
                posX2 += diffX;
            }
            if (dragType === DocElement.dragType.sizerSE || dragType === DocElement.dragType.sizerS ||
                dragType === DocElement.dragType.sizerSW) {
                posY2 += diffY;
            }
            if (dragType === DocElement.dragType.sizerSW || dragType === DocElement.dragType.sizerW ||
                dragType === DocElement.dragType.sizerNW) {
                posX1 += diffX;
            }
            if (posX1 < 0) {
                posX1 = 0;
            }
            if (posX2 < posX1) {
                posX2 = posX1;
            }
            if (posY1 < 0) {
                posY1 = 0;
            }
            if (posY2 < posY1) {
                posY2 = posY1;
            }
            if (posX2 > maxWidth) {
                posX2 = maxWidth;
            }
            if (posY2 > containerSize.height) {
                posY2 = containerSize.height;
            }
        }
        let width = posX2 - posX1;
        let height = posY2 - posY1;
        if (cmdGroup !== null) {
            let containerChanged = false;
            let container = this.getContainer();
            let containerSize = { width: 0, height: 0};
            if (dragContainer !== null && dragContainer.getId() !== this.getContainerId()) {
                containerChanged = true;
                containerSize = dragContainer.getContentSize();
                if (container !== null) {
                    let relativeOffset = dragContainer.getOffsetTo(container);
                    posX1 -= relativeOffset.x;
                    posY1 -= relativeOffset.y;
                }
            } else {
                containerSize = container.getContentSize();
            }
            if (!containerChanged || dragContainer.isElementAllowed(this.getElementType())) {
                this.checkBounds(posX1, posY1, width, height, containerSize, cmdGroup);

                if (containerChanged) {
                    let cmd = new SetValueCmd(this.id, null, 'containerId',
                        dragContainer.getId(), SetValueCmd.type.internal, this.rb);
                    cmdGroup.addCommand(cmd);
                    cmd = new MovePanelItemCmd(this.getPanelItem(), dragContainer.getPanelItem(),
                        dragContainer.getPanelItem().getChildren().length, this.rb);
                    cmdGroup.addCommand(cmd);
                }

                if (cmdGroup.isEmpty()) {
                    // nothing was changed, make sure displayed element is updated to saved position/size after drag
                    this.updateDisplay();
                }
            } else {
                this.updateDisplayInternal(this.xVal, this.yVal, this.widthVal, this.heightVal);
            }
        } else {
            this.updateDisplayInternal(posX1, posY1, width, height);
        }
    }

    select() {
        if (this.el !== null) {
            let elSizerContainer = this.getSizerContainerElement();
            let sizers = this.getSizers();
            for (let sizer of sizers) {
                let sizerVal = sizer;
                let elSizer = $(`<div class="rbroSizer rbroSizer${sizer}"></div>`)
                    .mousedown(event => {
                        this.rb.getDocument().startDrag(event.pageX, event.pageY,
                            this.id, this.containerId, this.linkedContainerId,
                            this.getElementType(), DocElement.dragType['sizer' + sizerVal]);
                        event.stopPropagation();
                    });
                elSizerContainer.append(elSizer);
            }
            this.el.addClass('rbroSelected');
            this.el.css('z-index', '10');
        }
        this.selected = true;
    }

    deselect() {
        if (this.el !== null) {
            let elSizerContainer = this.getSizerContainerElement();
            elSizerContainer.find('.rbroSizer').remove();
            this.el.css('z-index', '');
            this.el.removeClass('rbroSelected');
        }
        this.selected = false;
    }

    /**
     * Returns allowed sizers when element is selected.
     * @returns {String[]}
     */
    getSizers() {
        return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    }

    /**
     * Returns id for dom element of x value.
     * @returns {String} Is empty in case doc element does not have x value.
     */
    getXTagId() {
        return '';
    }

    /**
     * Returns id for dom element of y value.
     * @returns {String} Is empty in case doc element does not have y value.
     */
    getYTagId() {
        return '';
    }

    /**
     * Returns id for dom element of width value.
     * @returns {String} Is empty in case doc element does not have width value.
     */
    getWidthTagId() {
        return '';
    }

    /**
     * Returns id for dom element of height value.
     * @returns {String} Is empty in case doc element does not have height value.
     */
    getHeightTagId() {
        return '';
    }

    hasBorderSettings() {
        return false;
    }

    isDraggingAllowed() {
        return true;
    }

    /**
     * Returns true if another element can be dropped into this element (or its corresponding panel item).
     */
    isDroppingAllowed() {
        return true;
    }

    /**
     * Returns maximum allowed width of element.
     * This is needed when the element is resized by dragging so the resized element does not overflow its container.
     * @returns {Number}.
     */
    getMaxWidth() {
        let containerSize = this.getContainerContentSize();
        return containerSize.width;
    }

    createElement() {
    }

    getElement() {
        return this.el;
    }

    getSizerContainerElement() {
        return this.el;
    }

    /**
     * Returns dom node where elements will be added if they are inside this element.
     * Is null in case this element is not a container element like a frame or a band.
     * @returns {[Object]} dom node
     */
    getContentElement() {
        return null;
    }

    /**
     * Returns all parameters of the data source (which must be an array parameter).
     * Must be overridden when the element has a data source.
     * @returns {[Object]} contains the data source name and all parameters of the data source.
     * Is null in case element does not have a data source.
     */
    getDataSource() {
        return null;
    }

    /**
     * Returns all data source parameters of this element and any possible parent elements.
     * @param {Parameter[]} dataSources - array where the data sources will be appended to.
     * @param {DocElement} child - optional child element where the method was called from.
     */
    getAllDataSources(dataSources, child) {
        if (this.getElementType() === DocElement.type.table || this.getElementType() == DocElement.type.section) {
            if (child && child.getValue('bandType') === Band.bandType.content) {
                let dataSource = this.getDataSource();
                if (dataSource !== null) {
                    dataSources.push(dataSource);
                }
            }
        }
        let panelItem = this.getPanelItem();
        if (panelItem !== null) {
            let parentPanelItem = panelItem.getParent();
            if (parentPanelItem !== null && parentPanelItem.getData() instanceof DocElement) {
                parentPanelItem.getData().getAllDataSources(dataSources, this);
            }
        }
    }

    /**
     * Adds SetValue commands to command group parameter in case the specified parameter is used in any of
     * the object fields.
     * @param {Parameter} parameter - parameter which will be renamed.
     * @param {String} newParameterName - new name of the parameter.
     * @param {CommandGroupCmd} cmdGroup - possible SetValue commands will be added to this command group.
     */
    addCommandsForChangedParameterName(parameter, newParameterName, cmdGroup) {
    }

    /**
     * Adds SetValue command to command group parameter in case the specified parameter is used in the
     * specified object field.
     * @param {Parameter} parameter - parameter which will be renamed.
     * @param {String} newParameterName - new name of the parameter.
     * @param {String} tagId
     * @param {String} field
     * @param {CommandGroupCmd} cmdGroup - possible SetValue command will be added to this command group.
     */
    addCommandForChangedParameterName(parameter, newParameterName, tagId, field, cmdGroup) {
        let paramParent = parameter.getParent();
        let dataSources = [];
        let paramRef = null;
        let newParamRef = null;
        
        this.getAllDataSources(dataSources, null);

        if (paramParent !== null && paramParent.getValue('type') === Parameter.type.array) {
            if (dataSources.length > 0 && dataSources[0].parameters.indexOf(parameter) !== -1) {
                paramRef = '${' + parameter.getName() + '}';
                newParamRef = '${' + newParameterName + '}';
            }
        } else {
            if (paramParent !== null && paramParent.getValue('type') === Parameter.type.map) {
                paramRef = '${' + paramParent.getName() + '.' + parameter.getName() + '}';
                newParamRef = '${' + paramParent.getName() + '.' + newParameterName + '}';
            } else if (parameter.getValue('type') === Parameter.type.map) {
                paramRef = '${' + parameter.getName() + '.';
                newParamRef = '${' + newParameterName + '.';
            } else {
                let isDataSourceParam = false;
                for (let dataSource of dataSources) {
                    for (let dataSourceParam of dataSource.parameters) {
                        if (dataSourceParam.getName() === parameter.getName()) {
                            // the changed parameter has the same name as a used data source parameter, therefor
                            // we are not going to change the parameter reference because it references the data source parameter
                            isDataSourceParam = true;
                            break;
                        }
                    }
                }
                if (!isDataSourceParam) {
                    paramRef = '${' + parameter.getName() + '}';
                    newParamRef = '${' + newParameterName + '}';
                }
            }
        }

        if (paramRef !== null && newParamRef !== null && this.getValue(field).indexOf(paramRef) !== -1) {
            let cmd = new SetValueCmd(
                this.id, tagId, field, utils.replaceAll(this.getValue(field), paramRef, newParamRef),
                SetValueCmd.type.text, this.rb);
            cmdGroup.addCommand(cmd);
        }
    }

    /**
     * Adds AddDeleteDocElementCmd commands to command group parameter to delete this element and
     * any possible existing children.
     * @param {CommandGroupCmd} cmdGroup - AddDeleteDocElementCmd commands will be added to this command group.
     */
    addCommandsForDelete(cmdGroup) {
        let elements = [];
        this.appendContainerChildren(elements);
        elements.push(this);
        for (let element of elements) {
            let cmd = new AddDeleteDocElementCmd(
                false, element.getPanelItem().getPanelName(),
                element.toJS(), element.getId(), element.getContainerId(),
                element.getPanelItem().getSiblingPosition(), this.rb);
            cmdGroup.addCommand(cmd);
        }
    }

    addChildren(docElements) {
    }

    addError(error) {
        this.errors.push(error);
    }

    clearErrors() {
        this.errors = [];
    }

    getErrors() {
        return this.errors;
    }

    remove() {
        if (this.el !== null) {
            this.el.remove();
            this.el = null;
        }
        if (this.panelItem !== null) {
            this.panelItem.getParent().removeChild(this.panelItem);
            this.panelItem = null;
        }
    }

    toJS() {
        let ret = { elementType: this.getElementType() };
        for (let field of this.getFields()) {
            if (['x', 'y', 'width', 'height'].indexOf(field) === -1) {
                ret[field] = this.getValue(field);
            } else {
                ret[field] = this.getValue(field + 'Val');
            }
        }
        return ret;
    }

    toJSON() {
        return JSON.stringify(this.toJS());
    }
}

DocElement.type = {
    none: 'none',
    text: 'text',
    image: 'image',
    line: 'line',
    table: 'table',
    pageBreak: 'page_break',
    tableText: 'table_text',
    barCode: 'bar_code',
    frame: 'frame',
    section: 'section'
};

DocElement.dragType = {
    none: -1,
    element: 0,
    sizerN: 1,
    sizerNE: 2,
    sizerE: 3,
    sizerSE: 4,
    sizerS: 5,
    sizerSW: 6,
    sizerW: 7,
    sizerNW: 8
};
