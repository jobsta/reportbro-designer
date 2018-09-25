import DocElement from './DocElement';
import AddDeleteDocElementCmd from '../commands/AddDeleteDocElementCmd';
import Frame from '../container/Frame';
import SetValueCmd from '../commands/SetValueCmd';
import Style from '../data/Style';
import MainPanelItem from '../menu/MainPanelItem';
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
     * Returns highest id of this component, this is the id of the linked container because it is
     * created after the frame element.
     * @returns {Number}
     */
    getMaxId() {
        return this.linkedContainerId;
    }
    
    setValue(field, value, elSelector, isShown) {
        if (field.indexOf('border') !== -1) {
            // Style.setBorderValue needs to be called before super.setValue because it calls updateStyle() which expects
            // the correct border settings
            this[field] = value;
            if (field === 'borderWidth') {
                this.borderWidthVal = utils.convertInputToNumber(value);
            }
            Style.setBorderValue(this, field, '', value, elSelector, isShown);
        }

        super.setValue(field, value, elSelector, isShown);

        if (field === 'label') {
            this.updateName();
        }
    }

    updateDisplayInternal(x, y, width, height) {
        if (this.el !== null) {
            let props = { left: this.rb.toPixel(x), top: this.rb.toPixel(y),
                width: this.rb.toPixel(width), height: this.rb.toPixel(height) };
            this.el.css(props);
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

        let styleProperties = {};
        styleProperties['width'] = this.rb.toPixel(width);
        styleProperties['height'] = this.rb.toPixel(height);
        $(`#rbro_el_content_frame${this.id}`).css(styleProperties);
    }

    updateStyle() {
        let styleProperties = {};
        let borderStyleProperties = {};
        styleProperties['background-color'] = this.getValue('backgroundColor');
        if (this.getValue('borderLeft') || this.getValue('borderTop') ||
                this.getValue('borderRight') || this.getValue('borderBottom')) {
            borderStyleProperties['border-style'] = this.getValue('borderTop') ? 'solid' : 'none';
            borderStyleProperties['border-style'] += this.getValue('borderRight') ? ' solid' : ' none';
            borderStyleProperties['border-style'] += this.getValue('borderBottom') ? ' solid' : ' none';
            borderStyleProperties['border-style'] += this.getValue('borderLeft') ? ' solid' : ' none';
            borderStyleProperties['border-width'] = this.getValue('borderWidthVal') + 'px';
            borderStyleProperties['border-color'] = this.getValue('borderColor');
        } else {
            borderStyleProperties['border-style'] = 'none';
        }
        $(`#rbro_el_content${this.id}`).css(borderStyleProperties);
        this.el.css(styleProperties);
    }

    /**
     * Returns all data fields of this object. The fields are used when serializing the object.
     * @returns {String[]}
     */
    getFields() {
        return ['id', 'containerId', 'linkedContainerId', 'label',
            'x', 'y', 'width', 'height', 'backgroundColor',
            'borderAll', 'borderLeft', 'borderTop', 'borderRight', 'borderBottom', 'borderColor', 'borderWidth',
            'printIf', 'removeEmptyElement', 'shrinkToContentHeight',
            'spreadsheet_hide', 'spreadsheet_column', 'spreadsheet_addEmptyRow'];
    }

    getElementType() {
        return DocElement.type.frame;
    }

    getXTagId() {
        return 'rbro_frame_element_position_x';
    }

    getYTagId() {
        return 'rbro_frame_element_position_y';
    }

    getWidthTagId() {
        return 'rbro_frame_element_width';
    }

    getHeightTagId() {
        return 'rbro_frame_element_height';
    }

    createElement() {
        this.el = $(`<div id="rbro_el${this.id}" class="rbroDocElement rbroFrameElement rbroElementContainer"></div>`);
        // rbroContentContainerHelper contains border styles
        // rbroDocElementContentFrame contains width and height
        this.el
            .append($(`<div id="rbro_el_content${this.id}" class="rbroContentContainerHelper"></div>`)
                .append($(`<div id="rbro_el_content_frame${this.id}" class="rbroDocElementContentFrame"></div>`))
            );
        this.appendToContainer();
        this.registerEventHandlers();
    }

    getContentElement() {
        return $(`#rbro_el_content_frame${this.id}`);
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
        $(`#rbro_menu_item_name${this.id}`).text(this.name);
    }

    /**
     * Adds SetValue commands to command group parameter in case the specified parameter is used in any of
     * the object fields.
     * @param {Parameter} parameter - parameter which will be renamed.
     * @param {String} newParameterName - new name of the parameter.
     * @param {CommandGroupCmd} cmdGroup - possible SetValue commands will be added to this command group.
     */
    addCommandsForChangedParameterName(parameter, newParameterName, cmdGroup) {
        this.addCommandForChangedParameterName(parameter, newParameterName, 'rbro_frame_element_print_if', 'printIf', cmdGroup);
    }
}