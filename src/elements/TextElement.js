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
        this.strikethrough = false;
        this.horizontalAlignment = Style.alignment.left;
        this.verticalAlignment = Style.alignment.top;
        this.textColor = '#000000';
        this.backgroundColor = '';
        this.font = rb.getProperty('defaultFont');
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
        this.cs_strikethrough = false;
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
        this.link = '';

        this.spreadsheet_hide = false;
        this.spreadsheet_column = '';
        this.spreadsheet_colspan = '';
        this.spreadsheet_addEmptyRow = false;
        this.spreadsheet_textWrap = false;

        this.setInitialData(initialData);

        this.borderWidthVal = utils.convertInputToNumber(this.borderWidth);
    }

    setup(openPanelItem) {
        super.setup(openPanelItem);
        this.createElement();
        this.updateDisplay();
        this.updateStyle();
        this.updateContent(this.content);
    }

    handleDoubleClick(event) {
        super.handleDoubleClick(event);
        // focus text content input element and set caret at end of content
        let el = $('#rbro_doc_element_content').get(0);
        el.focus();
        if (typeof el.selectionStart === 'number') {
            el.selectionStart = el.selectionEnd = el.value.length;
        }
    }

    setValue(field, value) {
        if (field.indexOf('border') !== -1) {
            // Style.setBorderValue needs to be called before super.setValue
            // because it calls updateStyle() which expects the correct border settings
            this[field] = value;
            if (field.substr(0, 3) === 'cs_') {
                if (field === 'cs_borderWidth') {
                    this.borderWidthVal = utils.convertInputToNumber(value);
                }
                Style.setBorderValue(this, field, 'cs_', value, this.rb);
            } else {
                if (field === 'borderWidth') {
                    this.borderWidthVal = utils.convertInputToNumber(value);
                }
                Style.setBorderValue(this, field, '', value, this.rb);
            }
        }

        super.setValue(field, value);

        if (field === 'content') {
            this.updateContent(value);
        } else if (field === 'width' || field === 'height') {
            this.updateDisplay();
        }
    }

    /**
     * Returns all fields of this object that can be modified in the properties panel.
     * @returns {String[]}
     */
    getProperties() {
        return ['x', 'y', 'width', 'height', 'content', 'eval',
            'styleId', 'bold', 'italic', 'underline', 'strikethrough',
            'horizontalAlignment', 'verticalAlignment', 'textColor', 'backgroundColor', 'font', 'fontSize',
            'lineSpacing', 'borderColor', 'borderWidth',
            'borderAll', 'borderLeft', 'borderTop', 'borderRight', 'borderBottom',
            'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom',
            'printIf', 'removeEmptyElement', 'alwaysPrintOnSamePage', 'pattern', 'link',
            'cs_condition', 'cs_styleId', 'cs_bold', 'cs_italic', 'cs_underline', 'cs_strikethrough',
            'cs_horizontalAlignment', 'cs_verticalAlignment',
            'cs_textColor', 'cs_backgroundColor', 'cs_font', 'cs_fontSize',
            'cs_lineSpacing', 'cs_borderColor', 'cs_borderWidth',
            'cs_borderAll', 'cs_borderLeft', 'cs_borderTop', 'cs_borderRight', 'cs_borderBottom',
            'cs_paddingLeft', 'cs_paddingTop', 'cs_paddingRight', 'cs_paddingBottom',
            'spreadsheet_hide', 'spreadsheet_column', 'spreadsheet_colspan',
            'spreadsheet_addEmptyRow', 'spreadsheet_textWrap'];
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

    /**
     * Adds commands to command group parameter to set style properties of given style.
     *
     * This should be called when the style was changed so all style properties
     * will be updated as well.
     *
     * @param {String} styleId - id of new style or empty string if no style was selected.
     * @param {String} fieldPrefix - field prefix when accessing properties.
     * @param {Object[]} propertyDescriptors - list of all property descriptors to get
     * property type for SetValueCmd.
     * @param {CommandGroupCmd} cmdGroup - commands will be added to this command group.
     */
    addCommandsForChangedStyle(styleId, fieldPrefix, propertyDescriptors, cmdGroup) {
        if (styleId !== '') {
            let style = this.rb.getStyleById(styleId);
            if (style !== null) {
                let fields = style.getFields().slice(2);  // get all fields except id and name
                for (let field of fields) {
                    let objField = fieldPrefix + field;
                    let value = style.getValue(field);
                    if (value !== this.getValue(objField)) {
                        let propertyDescriptor = propertyDescriptors[objField];
                        let cmd = new SetValueCmd(
                            this.getId(), objField, value, propertyDescriptor['type'], this.rb);
                        cmd.disableSelect();
                        cmdGroup.addCommand(cmd);
                    }
                }
            }
        }
        cmdGroup.addCommand(new SetValueCmd(
            this.getId(), fieldPrefix + 'styleId', styleId, SetValueCmd.type.select, this.rb));
    }

    getContentSize(width, height, style) {
        let borderWidth = style.getValue('borderWidthVal');
        width -= utils.convertInputToNumber(style.getValue('paddingLeft')) + utils.convertInputToNumber(style.getValue('paddingRight'));
        if (style.getValue('borderLeft')) {
            width -= borderWidth;
        }
        if (style.getValue('borderRight')) {
            width -= borderWidth;
        }
        height -= utils.convertInputToNumber(style.getValue('paddingTop')) + utils.convertInputToNumber(style.getValue('paddingBottom'));
        if (style.getValue('borderTop')) {
            height -= borderWidth;
        }
        if (style.getValue('borderBottom')) {
            height -= borderWidth;
        }
        return { width: width, height: height };
    }

    updateStyle() {
        let styleProperties = {};
        let borderStyleProperties = {};
        let style = this.getStyle();
        let contentSize = this.getContentSize(this.getDisplayWidth(), this.getDisplayHeight(), style);
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
        if (style.getValue('underline') && style.getValue('strikethrough')) {
            styleProperties['text-decoration'] = 'underline line-through';
        } else if (style.getValue('underline')) {
            styleProperties['text-decoration'] = 'underline';
        } else if (style.getValue('strikethrough')) {
            styleProperties['text-decoration'] = 'line-through';
        } else {
            styleProperties['text-decoration'] = 'none';
        }
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
            borderStyleProperties['border-width'] = style.getValue('borderWidthVal') + 'px';
            borderStyleProperties['border-color'] = style.getValue('borderColor');
        } else {
            borderStyleProperties['border-style'] = 'none';
        }
        if (style.getValue('paddingLeft') !== '' || style.getValue('paddingTop') !== '' ||
                style.getValue('paddingRight') !== '' || style.getValue('paddingBottom') !== '') {
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

    hasBorderSettings() {
        return true;
    }

    createElement() {
        this.el = $(`<div id="rbro_el${this.id}" class="rbroDocElement rbroTextElement"></div>`);
        // rbroContentContainerHelper contains border styles and alignment classes
        // rbroDocElementContentText contains specific styles
        // span is needed to preserve whitespaces and word-wrap of actual text content
        this.el
            .append($(`<div id="rbro_el_content${this.id}" class="rbroContentContainerHelper"></div>`)
                .append($(`<div id="rbro_el_content_text${this.id}" class="rbroDocElementContentText"></div>`)
                    .append($(`<span id="rbro_el_content_text_data${this.id}"></span>`))
            ));
        this.appendToContainer();
        $(`#rbro_el_content_text_data${this.id}`).text(this.content);
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
        $(`#rbro_el_content_text_data${this.id}`).text(value);
    }

    /**
     * Adds SetValue commands to command group parameter in case the specified parameter is used in any of
     * the object fields.
     * @param {Parameter} parameter - parameter which will be renamed.
     * @param {String} newParameterName - new name of the parameter.
     * @param {CommandGroupCmd} cmdGroup - possible SetValue commands will be added to this command group.
     */
    addCommandsForChangedParameterName(parameter, newParameterName, cmdGroup) {
        this.addCommandForChangedParameterName(parameter, newParameterName, 'content', cmdGroup);
        this.addCommandForChangedParameterName(parameter, newParameterName, 'printIf', cmdGroup);
        this.addCommandForChangedParameterName(parameter, newParameterName, 'cs_condition', cmdGroup);
    }

    toJS() {
        let ret = super.toJS();
        for (let field of ['borderWidth', 'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom',
                'cs_paddingLeft', 'cs_paddingTop', 'cs_paddingRight', 'cs_paddingBottom']) {
            ret[field] = utils.convertInputToNumber(this.getValue(field));
        }
        return ret;
    }

    /**
     * Returns class name.
     * This can be useful for introspection when the class names are mangled
     * due to the webpack uglification process.
     * @returns {string}
     */
    getClassName() {
        return 'TextElement';
    }
}
