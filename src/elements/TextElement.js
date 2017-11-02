import DocElement from './DocElement';
import SetValueCmd from '../commands/SetValueCmd';
import Style from '../data/Style';
import * as utils from '../utils';

/**
 * Text doc element.
 * @class
 */
export default class TextElement extends DocElement {
    constructor(id, initialData, rb) {
        super(rb.getLabel('docElementText'), id, 100, 20, rb);
        this.content = '';
        this.eval = false;

        this.styleId = '';
        this.bold = false;
        this.italic = false;
        this.underline = false;
        this.horizontalAlignment = Style.alignment.left;
        this.verticalAlignment = Style.alignment.top;
        this.textColor = '#000000';
        this.backgroundColor = '';
        this.font = Style.font.helvetica;
        this.fontSize = 12;
        this.lineSpacing = 1;
        this.borderColor = '#000000';
        this.borderWidth = '1';
        this.borderAll = false;
        this.borderLeft = false;
        this.borderTop = false;
        this.borderRight = false;
        this.borderBottom = false;
        this.paddingLeft = '2';
        this.paddingTop = '2';
        this.paddingRight = '2';
        this.paddingBottom = '2';
        
        this.cs_condition = '';
        this.cs_styleId = '';
        this.cs_bold = false;
        this.cs_italic = false;
        this.cs_underline = false;
        this.cs_horizontalAlignment = Style.alignment.left;
        this.cs_verticalAlignment = Style.alignment.top;
        this.cs_textColor = '#000000';
        this.cs_backgroundColor = '';
        this.cs_font = Style.font.helvetica;
        this.cs_fontSize = 12;
        this.cs_lineSpacing = 1;
        this.cs_borderColor = '#000000';
        this.cs_borderWidth = '1';
        this.cs_borderAll = false;
        this.cs_borderLeft = false;
        this.cs_borderTop = false;
        this.cs_borderRight = false;
        this.cs_borderBottom = false;
        this.cs_paddingLeft = '2';
        this.cs_paddingTop = '2';
        this.cs_paddingRight = '2';
        this.cs_paddingBottom = '2';
        
        this.alwaysPrintOnSamePage = true;
        this.pattern = '';

        this.spreadsheet_hide = false;
        this.spreadsheet_column = '';
        this.spreadsheet_addEmptyRow = false;

        this.setInitialData(initialData);
    }

    setup() {
        super.setup();
        this.createElement();
        this.updateDisplay();
        this.updateStyle();
        this.updateContent(this.content);
    }

    setValue(field, value, elSelector, isShown) {
        if (field.indexOf('border') !== -1) {
            // Style.setBorderValue needs to be called before super.setValue because it calls updateStyle() which expects
            // the correct border settings
            this[field] = value;
            if (field.substr(0, 3) === 'cs_') {
                Style.setBorderValue(this, field, 'cs_', value, elSelector, isShown);
            } else {
                Style.setBorderValue(this, field, '', value, elSelector, isShown);
            }
        }

        super.setValue(field, value, elSelector, isShown);

        if (field === 'content') {
            this.updateContent(value);
        } else if (field === 'width' || field === 'height') {
            this.updateDisplay();
        } else if (field === 'styleId') {
            if (value !== '') {
                $('#rbro_text_element_style_settings').hide();
            } else {
                $('#rbro_text_element_style_settings').show();
            }
        } else if (field === 'cs_styleId') {
            if (value != '') {
                $('#rbro_text_element_cs_style_settings').hide();
            } else {
                $('#rbro_text_element_cs_style_settings').show();
            }
        }
    }

    /**
     * Returns all data fields of this object. The fields are used when serializing the object.
     * @returns {String[]}
     */
    getFields() {
        return ['id', 'containerId', 'x', 'y', 'width', 'height', 'content', 'eval',
            'styleId', 'bold', 'italic', 'underline',
            'horizontalAlignment', 'verticalAlignment', 'textColor', 'backgroundColor', 'font', 'fontSize',
            'lineSpacing', 'borderColor', 'borderWidth',
            'borderAll', 'borderLeft', 'borderTop', 'borderRight', 'borderBottom',
            'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom',
            'printIf', 'removeEmptyElement', 'alwaysPrintOnSamePage', 'pattern',
            'cs_condition', 'cs_styleId', 'cs_bold', 'cs_italic', 'cs_underline',
            'cs_horizontalAlignment', 'cs_verticalAlignment', 'cs_textColor', 'cs_backgroundColor', 'cs_font', 'cs_fontSize',
            'cs_lineSpacing', 'cs_borderColor', 'cs_borderWidth',
            'cs_borderAll', 'cs_borderLeft', 'cs_borderTop', 'cs_borderRight', 'cs_borderBottom',
            'cs_paddingLeft', 'cs_paddingTop', 'cs_paddingRight', 'cs_paddingBottom',
            'spreadsheet_hide', 'spreadsheet_column', 'spreadsheet_addEmptyRow'];
    }

    getElementType() {
        return DocElement.type.text;
    }

    updateDisplayInternal(x, y, width, height) {
        if (this.el !== null) {
            let props = { left: this.rb.toPixel(x), top: this.rb.toPixel(y),
                width: this.rb.toPixel(width), height: this.rb.toPixel(height) };
            this.el.css(props);
        }
        // update inner text element size
        let contentSize = this.getContentSize(width, height, this.getStyle());
        let styleProperties = {};
        styleProperties['width'] = this.rb.toPixel(contentSize.width);
        styleProperties['height'] = this.rb.toPixel(contentSize.height);
        $(`#rbro_el_content_text${this.id}`).css(styleProperties);
    }

    getStyle() {
        let style = this;
        if (this.styleId !== '') {
            let styleObj = this.rb.getDataObject(this.styleId);
            if (styleObj !== null) {
                style = styleObj;
            }
        }
        return style;
    }

    getContentSize(width, height, style) {
        let borderWidth = utils.convertInputToNumber(style.getValue('borderWidth'));
        width -= utils.convertInputToNumber(style.getValue('paddingLeft')) + utils.convertInputToNumber(style.getValue('paddingRight'));
        if (this.borderLeft) {
            width -= borderWidth;
        }
        if (this.borderRight) {
            width -= borderWidth;
        }
        height -= utils.convertInputToNumber(style.getValue('paddingTop')) + utils.convertInputToNumber(style.getValue('paddingBottom'));
        if (this.borderTop) {
            height -= borderWidth;
        }
        if (this.borderBottom) {
            height -= borderWidth;
        }
        return { width: width, height: height };
    }

    updateStyle() {
        let styleProperties = {};
        let borderStyleProperties = {};
        let style = this.getStyle();
        let contentSize = this.getContentSize(this.widthVal, this.heightVal, style);
        let horizontalAlignment = style.getValue('horizontalAlignment');
        let verticalAlignment = style.getValue('verticalAlignment');
        let alignClass = 'rbroDocElementAlign' + horizontalAlignment.charAt(0).toUpperCase() + horizontalAlignment.slice(1);
        let valignClass = 'rbroDocElementVAlign' + verticalAlignment.charAt(0).toUpperCase() + verticalAlignment.slice(1);
        styleProperties['width'] = this.rb.toPixel(contentSize.width);
        styleProperties['height'] = this.rb.toPixel(contentSize.height);
        styleProperties['text-align'] = horizontalAlignment;
        styleProperties['vertical-align'] = verticalAlignment;
        styleProperties['background-color'] = style.getValue('backgroundColor');
        styleProperties['font-weight'] = style.getValue('bold') ? 'bold' : '';
        styleProperties['font-style'] = style.getValue('italic') ? 'italic' : 'normal';
        styleProperties['text-decoration'] = style.getValue('underline') ? 'underline' : 'none';
        styleProperties['color'] = style.getValue('textColor');
        styleProperties['font-family'] = style.getValue('font');
        styleProperties['font-size'] = style.getValue('fontSize') + 'px';
        styleProperties['line-height'] = (style.getValue('lineSpacing') * 100.0) + '%';
        if (style.getValue('borderLeft') || style.getValue('borderTop') ||
                style.getValue('borderRight') || style.getValue('borderBottom')) {
            borderStyleProperties['border-style'] = style.getValue('borderTop') ? 'solid' : 'none';
            borderStyleProperties['border-style'] += style.getValue('borderRight') ? ' solid' : ' none';
            borderStyleProperties['border-style'] += style.getValue('borderBottom') ? ' solid' : ' none';
            borderStyleProperties['border-style'] += style.getValue('borderLeft') ? ' solid' : ' none';
            borderStyleProperties['border-width'] = style.getValue('borderWidth') + 'px';
            borderStyleProperties['border-color'] = style.getValue('borderColor');
        } else {
            borderStyleProperties['border-style'] = 'none';
        }
        if (style.getValue('paddingLeft') != '' || style.getValue('paddingTop') != '' ||
                style.getValue('paddingRight') != '' || style.getValue('paddingBottom') != '') {
            styleProperties['padding'] = this.rb.toPixel(style.getValue('paddingTop'));
            styleProperties['padding'] += ' ' + this.rb.toPixel(style.getValue('paddingRight'));
            styleProperties['padding'] += ' ' + this.rb.toPixel(style.getValue('paddingBottom'));
            styleProperties['padding'] += ' ' + this.rb.toPixel(style.getValue('paddingLeft'));
        } else {
            styleProperties['padding'] = '';
        }
        $(`#rbro_el_content${this.id}`).css(borderStyleProperties);
        $(`#rbro_el_content${this.id}`).removeClass().addClass('rbroContentContainerHelper').addClass(alignClass).addClass(valignClass);
        $(`#rbro_el_content_text${this.id}`).css(styleProperties);
    }

    getXTagId() {
        return 'rbro_text_element_position_x';
    }

    getYTagId() {
        return 'rbro_text_element_position_y';
    }

    getWidthTagId() {
        return 'rbro_text_element_width';
    }

    getHeightTagId() {
        return 'rbro_text_element_height';
    }

    hasBorderSettings() {
        return true;
    }

    createElement() {
        this.el = $(`<div id="rbro_el${this.id}" class="rbroDocElement rbroTextElement"></div>`);
        // rbroContentContainerHelper contains border styles and alignment classes
        // rbroDocElementContentText contains specific styles
        this.el
            .append($(`<div id="rbro_el_content${this.id}" class="rbroContentContainerHelper"></div>`)
                .append($(`<div id="rbro_el_content_text${this.id}" class="rbroDocElementContentText"></div>`))
            );
        this.appendToContainer();
        $(`#rbro_el_content_text${this.id}`).text(this.content);
        super.registerEventHandlers();
    }

    updateContent(value) {
        if (value.trim() === '') {
            this.name = this.rb.getLabel('docElementText');
        } else {
            this.name = value;
        }
        $(`#rbro_menu_item_name${this.id}`).text(this.name);
        $(`#rbro_menu_item_name${this.id}`).attr('title', this.name);
        $(`#rbro_el_content_text${this.id}`).text(value);
    }

    /**
     * Adds SetValue commands to command group parameter in case the specified parameter is used in any of
     * the object fields.
     * @param {String} oldParameterName
     * @param {String} newParameterName
     * @param {CommandGroupCmd} cmdGroup - possible SetValue commands will be added to this command group.
     */
    addCommandsForChangedParameter(oldParameterName, newParameterName, cmdGroup) {
        if (this.content.indexOf(oldParameterName) !== -1) {
            let cmd = new SetValueCmd(this.id, 'rbro_text_element_content', 'content',
                utils.replaceAll(this.content, oldParameterName, newParameterName), SetValueCmd.type.text, this.rb);
            cmdGroup.addCommand(cmd);
        }
        if (this.printIf.indexOf(oldParameterName) !== -1) {
            let cmd = new SetValueCmd(this.id, 'rbro_text_element_print_if', 'printIf',
                utils.replaceAll(this.printIf, oldParameterName, newParameterName), SetValueCmd.type.text, this.rb);
            cmdGroup.addCommand(cmd);
        }
        if (this.cs_condition.indexOf(oldParameterName) !== -1) {
            let cmd = new SetValueCmd(this.id, 'rbro_text_element_cs_condition', 'cs_condition',
                utils.replaceAll(this.cs_condition, oldParameterName, newParameterName), SetValueCmd.type.text, this.rb);
            cmdGroup.addCommand(cmd);
        }
    }

    toJS() {
        let ret = super.toJS();
        for (let field of ['borderWidth', 'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom',
                'cs_paddingLeft', 'cs_paddingTop', 'cs_paddingRight', 'cs_paddingBottom']) {
            ret[field] = utils.convertInputToNumber(this.getValue(field));
        }
        return ret;
    }
}
