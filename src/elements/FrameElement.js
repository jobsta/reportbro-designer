import DocElement from './DocElement';
import Frame from '../container/Frame';
import Style from '../data/Style';
import * as utils from '../utils';

/**
 * Frame element. Frames can contain any number of other doc element. These doc elements
 * are positioned relative to the frame.
 * @class
 */
export default class FrameElement extends DocElement {
    constructor(id, initialData, rb) {
        super(rb.getLabel('docElementFrame'), id, 100, 100, rb);
        this.frame = null;
        this.setupComplete = false;
        this.elContent = null;
        this.elContentFrame = null;
        this.label = '';
        this.backgroundColor = '';
        this.borderAll = false;
        this.borderLeft = false;
        this.borderTop = false;
        this.borderRight = false;
        this.borderBottom = false;
        this.borderColor = '#000000';
        this.borderWidth = '1';

        this.shrinkToContentHeight = false;

        this.spreadsheet_hide = false;
        this.spreadsheet_column = '';
        this.spreadsheet_addEmptyRow = false;

        this.setInitialData(initialData);

        this.borderWidthVal = utils.convertInputToNumber(this.borderWidth);
    }

    setup(openPanelItem) {
        this.borderWidthVal = utils.convertInputToNumber(this.borderWidth);
        super.setup();
        this.createElement();
        this.updateDisplay();

        if (this.linkedContainerId === null) {
            this.linkedContainerId = this.rb.getUniqueId();
        }
        this.frame = new Frame(this.linkedContainerId, 'frame_' + this.linkedContainerId, this.rb);
        this.frame.init(this);
        this.rb.addContainer(this.frame);

        this.setupComplete = true;
        this.updateStyle();
        this.updateName();
        if (openPanelItem){
            this.panelItem.open();
        }
    }

    /**
     * Register event handler for a container element so it can be dragged and
     * allow selection on double click.
     */
    registerEventHandlers() {
        super.registerContainerEventHandlers();
    }

    /**
     * Returns highest id of this component, this is the id of the linked container because it is
     * created after the frame element.
     * @returns {Number}
     */
    getMaxId() {
        return this.linkedContainerId;
    }

    setValue(field, value) {
        if (field.indexOf('border') !== -1) {
            // Style.setBorderValue needs to be called before super.setValue
            // because it calls updateStyle() which expects the correct border settings
            this[field] = value;
            if (field === 'borderWidth') {
                this.borderWidthVal = utils.convertInputToNumber(value);
            }
            Style.setBorderValue(this, field, '', value, this.rb);
        }

        super.setValue(field, value);

        if (field === 'label') {
            this.updateName();
        }
    }

    updateDisplayInternal(x, y, width, height) {
        if (this.el !== null) {
            this.el.style.left = this.rb.toPixel(x);
            this.el.style.top = this.rb.toPixel(y);
            this.el.style.width = this.rb.toPixel(width);
            this.el.style.height = this.rb.toPixel(height);
        }
        // update inner frame element size
        if (this.borderLeft) {
            width -= this.borderWidthVal;
        }
        if (this.borderRight) {
            width -= this.borderWidthVal;
        }
        if (this.borderTop) {
            height -= this.borderWidthVal;
        }
        if (this.borderBottom) {
            height -= this.borderWidthVal;
        }

        this.elContentFrame.style.width = this.rb.toPixel(width);
        this.elContentFrame.style.height = this.rb.toPixel(height);
    }

    updateStyle() {
        let borderStyleProperties = {};
        let borderStyle;
        if (this.getValue('borderLeft') || this.getValue('borderTop') ||
                this.getValue('borderRight') || this.getValue('borderBottom')) {
            borderStyle = this.getValue('borderTop') ? 'solid' : 'none';
            borderStyle += this.getValue('borderRight') ? ' solid' : ' none';
            borderStyle += this.getValue('borderBottom') ? ' solid' : ' none';
            borderStyle += this.getValue('borderLeft') ? ' solid' : ' none';
            this.elContent.style.borderWidth = this.getValue('borderWidthVal') + 'px';
            this.elContent.style.borderColor = this.getValue('borderColor');
        } else {
            borderStyle = 'none';
        }
        this.elContent.style.borderStyle = borderStyle;
        this.el.style.backgroundColor = this.getValue('backgroundColor');
    }

    /**
     * Returns all data fields of this object. The fields are used when serializing the object.
     * @returns {String[]}
     */
    getFields() {
        let fields = this.getProperties();
        fields.splice(0, 0, 'id', 'containerId', 'linkedContainerId');
        return fields;
    }

    /**
     * Returns all fields of this object that can be modified in the properties panel.
     * @returns {String[]}
     */
    getProperties() {
        return [
            'label', 'x', 'y', 'width', 'height', 'styleId', 'backgroundColor',
            'borderAll', 'borderLeft', 'borderTop', 'borderRight', 'borderBottom', 'borderColor', 'borderWidth',
            'printIf', 'removeEmptyElement', 'shrinkToContentHeight', 'alignToPageBottom',
            'spreadsheet_hide', 'spreadsheet_column', 'spreadsheet_addEmptyRow'
        ];
    }

    getElementType() {
        return DocElement.type.frame;
    }

    isAreaSelectionAllowed() {
        return false;
    }

    createElement() {
        this.el = utils.createElement(
            'div', { id: `rbro_el${this.id}`, class: 'rbroDocElement rbroFrameElement rbroElementContainer' });
        // rbroContentContainerHelper contains border styles
        // rbroDocElementContentFrame contains width and height
        this.elContent = utils.createElement(
            'div', { id: `rbro_el_content${this.id}`, class: 'rbroContentContainerHelper' });
        this.elContentFrame = utils.createElement(
            'div', { id: `rbro_el_content_frame${this.id}`, class: 'rbroDocElementContentFrame' });
        this.elContent.append(this.elContentFrame);
        this.el.append(this.elContent);
        this.appendToContainer();
        this.registerEventHandlers();
    }

    getContentElement() {
        return this.elContentFrame;
    }

    remove() {
        super.remove();
        this.rb.deleteContainer(this.frame);
    }

    updateName() {
        if (this.label.trim() !== '') {
            this.name = this.label;
        } else {
            this.name = this.rb.getLabel('docElementFrame');
        }
        document.getElementById(`rbro_menu_item_name${this.id}`).textContent = this.name;
    }

    /**
     * Adds SetValue commands to command group parameter in case the specified parameter is used in any of
     * the object fields.
     * @param {Parameter} parameter - parameter which will be renamed.
     * @param {String} newParameterName - new name of the parameter.
     * @param {CommandGroupCmd} cmdGroup - possible SetValue commands will be added to this command group.
     */
    addCommandsForChangedParameterName(parameter, newParameterName, cmdGroup) {
        this.addCommandForChangedParameterName(parameter, newParameterName, 'printIf', cmdGroup);
    }

    /**
     * Returns class name.
     * This can be useful for introspection when the class names are mangled
     * due to the webpack uglification process.
     * @returns {string}
     */
    getClassName() {
        return 'FrameElement';
    }
}