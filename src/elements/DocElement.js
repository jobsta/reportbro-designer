import Document from '../Document';
import MovePanelItemCmd from '../commands/MovePanelItemCmd';
import SetValueCmd from '../commands/SetValueCmd';
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
    setup() {
        let container = this.getContainer();
        if (container !== null) {
            // adapt position if new element is outside container
            let containerSize = container.getSize();
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
                this.rb.selectObject(this.id, !event.shiftKey);
                event.stopPropagation();
            }
        } else {
            if (event.shiftKey) {
                this.rb.deselectObject(this.id);
            } else {
                this.rb.getDocument().startDrag(event.originalEvent.pageX, event.originalEvent.pageY,
                    this.containerId, this.linkedContainerId,
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

    getContainerSize() {
        let container = this.getContainer();
        return (container !== null) ? container.getSize() : { width: 0, height: 0 };
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
        if (this.styleId == styleId) {
            this.updateStyle();
        }
    }

    updateDrag(diffX, diffY, dragType, dragContainer, gridSize, cmdGroup) {
        let posX1 = this.xVal;
        let posY1 = this.yVal;
        let posX2 = posX1 + this.widthVal;
        let posY2 = posY1 + this.heightVal;
        let maxWidth = this.getMaxWidth();
        const MIN_DRAG_SIZE = 20;
        if (dragType === DocElement.dragType.element) {
            posX1 += diffX;
            if (gridSize !== 0) {
                posX1 = utils.roundValueToInterval(posX1, gridSize);
            }
            posX2 = posX1 + this.widthVal;
            posY1 += diffY;
            if (gridSize !== 0) {
                posY1 = utils.roundValueToInterval(posY1, gridSize);
            }
            posY2 = posY1 + this.heightVal;
        } else {
            let containerSize = this.getContainerSize();
            if (dragType === DocElement.dragType.sizerNW || dragType === DocElement.dragType.sizerN || dragType === DocElement.dragType.sizerNE) {
                posY1 += diffY;
                if (gridSize !== 0) {
                    posY1 = utils.roundValueToInterval(posY1, gridSize);
                }
                if (posY1 > posY2 - MIN_DRAG_SIZE) {
                    if (gridSize !== 0) {
                        posY1 = utils.roundValueToLowerInterval(posY2 - MIN_DRAG_SIZE, gridSize);
                    } else {
                        posY1 = posY2 - MIN_DRAG_SIZE;
                    }
                } else if (posY1 < 0) {
                    posY1 = 0;
                }
            }
            if (dragType === DocElement.dragType.sizerNE || dragType === DocElement.dragType.sizerE || dragType === DocElement.dragType.sizerSE) {
                posX2 += diffX;
                if (gridSize !== 0) {
                    posX2 = utils.roundValueToInterval(posX2, gridSize);
                }
                if (posX2 < posX1 + MIN_DRAG_SIZE) {
                    if (gridSize !== 0) {
                        posX2 = utils.roundValueToUpperInterval(posX1 + MIN_DRAG_SIZE, gridSize);
                    } else {
                        posX2 = posX1 + MIN_DRAG_SIZE;
                    }
                } else if (posX2 > maxWidth) {
                    posX2 = maxWidth;
                }
            }
            if (dragType === DocElement.dragType.sizerSE || dragType === DocElement.dragType.sizerS || dragType === DocElement.dragType.sizerSW) {
                posY2 += diffY;
                if (gridSize !== 0) {
                    posY2 = utils.roundValueToInterval(posY2, gridSize);
                }
                if (posY2 < posY1 + MIN_DRAG_SIZE) {
                    if (gridSize !== 0) {
                        posY2 = utils.roundValueToUpperInterval(posY1 + MIN_DRAG_SIZE, gridSize);
                    } else {
                        posY2 = posY1 + MIN_DRAG_SIZE;
                    }
                } else if (posY2 > containerSize.height) {
                    posY2 = containerSize.height;
                }
            }
            if (dragType === DocElement.dragType.sizerSW || dragType === DocElement.dragType.sizerW || dragType === DocElement.dragType.sizerNW) {
                posX1 += diffX;
                if (gridSize !== 0) {
                    posX1 = utils.roundValueToInterval(posX1, gridSize);
                }
                if (posX1 > posX2 - MIN_DRAG_SIZE) {
                    if (gridSize !== 0) {
                        posX1 = utils.roundValueToLowerInterval(posX2 - MIN_DRAG_SIZE, gridSize);
                    } else {
                        posX1 = posX2 - MIN_DRAG_SIZE;
                    }
                } else if (posX1 < 0) {
                    posX1 = 0;
                }
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
                containerSize = dragContainer.getSize();
                if (container !== null) {
                    let relativeOffset = dragContainer.getOffsetTo(container);
                    posX1 -= relativeOffset.x;
                    posY1 -= relativeOffset.y;
                }
            } else {
                containerSize = container.getSize();
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
        let elSizerContainer = this.getSizerContainerElement();
        let sizers = this.getSizers();
        for (let sizer of sizers) {
            let sizerVal = sizer;
            let elSizer = $(`<div class="rbroSizer rbroSizer${sizer}"></div>`)
                .mousedown(event => {
                    this.rb.getDocument().startDrag(event.pageX, event.pageY,
                        this.containerId, this.linkedContainerId,
                        this.getElementType(), DocElement.dragType['sizer' + sizerVal]);
                    event.stopPropagation();
                });
            elSizerContainer.append(elSizer);
        }
        this.el.addClass('rbroSelected');
        this.el.css('z-index', '10');
        this.selected = true;
    }

    deselect() {
        let elSizerContainer = this.getSizerContainerElement();
        elSizerContainer.find('.rbroSizer').remove();
        this.el.css('z-index', '');
        this.el.removeClass('rbroSelected');
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
     * Returns maximum allowed width of element.
     * This is needed when the element is resized by dragging so the resized element does not overflow its container.
     * @returns {Number}.
     */
    getMaxWidth() {
        let containerSize = this.getContainerSize();
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
     * Adds SetValue commands to command group parameter in case the specified parameter is used in any of
     * the object fields.
     * @param {String} oldParameterName
     * @param {String} newParameterName
     * @param {CommandGroupCmd} cmdGroup - possible SetValue commands will be added to this command group.
     */
    addCommandsForChangedParameter(oldParameterName, newParameterName, cmdGroup) {
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
    band: 'band',
    frame: 'frame'
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
