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
        this.elContent = null;
        this.elContentText = null;
        this.elContentTextData = null;

        this.content = '';
        this.richText = false;
        this.richTextContent = null;
        this.richTextHtml = '';
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
        this.cs_additionalRules = '';
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
        this.spreadsheet_type = '';
        this.spreadsheet_pattern = '';
        this.spreadsheet_textWrap = false;
        this.setInitialData(initialData);

        this.borderWidthVal = utils.convertInputToNumber(this.borderWidth);
    }

    setup(openPanelItem) {
        super.setup(openPanelItem);
        this.createElement();
        this.updateDisplay();
        this.updateStyle();

        if (this.richText) {
            this.setupRichText();
        } else {
            this.updateContent(this.content);
        }
    }

    handleDoubleClick(event) {
        super.handleDoubleClick(event);
        // focus text content input element and set caret at end of content
        let el = document.getElementById('rbro_doc_element_content');
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
            if (field.substring(0, 3) === 'cs_') {
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
        } else if (field === 'richText') {
            if (value) {
                this.setupRichText();
            } else {
                this.updateContent(this.content);
            }
            this.updateStyle();
        } else if (field === 'richTextContent') {
            this.updateRichTextContent(value);
        } else if (field === 'richTextHtml') {
            document.getElementById(`rbro_el_content_text_data${this.id}`).innerHTML = value;
        }
    }

    /**
     * Returns all fields of this object that can be modified in the properties panel.
     * @returns {String[]}
     */
    getProperties() {
        return [
            'x', 'y', 'width', 'height', 'content', 'richText', 'richTextContent', 'richTextHtml', 'eval',
            'styleId', 'bold', 'italic', 'underline', 'strikethrough',
            'horizontalAlignment', 'verticalAlignment', 'textColor', 'backgroundColor', 'font', 'fontSize',
            'lineSpacing', 'borderColor', 'borderWidth',
            'borderAll', 'borderLeft', 'borderTop', 'borderRight', 'borderBottom',
            'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom',
            'printIf', 'removeEmptyElement', 'alwaysPrintOnSamePage', 'pattern', 'link',
            'cs_condition', 'cs_styleId', 'cs_additionalRules',
            'cs_bold', 'cs_italic', 'cs_underline', 'cs_strikethrough',
            'cs_horizontalAlignment', 'cs_verticalAlignment',
            'cs_textColor', 'cs_backgroundColor', 'cs_font', 'cs_fontSize',
            'cs_lineSpacing', 'cs_borderColor', 'cs_borderWidth',
            'cs_borderAll', 'cs_borderLeft', 'cs_borderTop', 'cs_borderRight', 'cs_borderBottom',
            'cs_paddingLeft', 'cs_paddingTop', 'cs_paddingRight', 'cs_paddingBottom',
            'spreadsheet_hide', 'spreadsheet_column', 'spreadsheet_colspan',
            'spreadsheet_addEmptyRow', 'spreadsheet_type', 'spreadsheet_pattern', 'spreadsheet_textWrap'
        ];
    }

    getElementType() {
        return DocElement.type.text;
    }

    updateDisplayInternal(x, y, width, height) {
        if (this.el !== null) {
            this.el.style.left = this.rb.toPixel(x);
            this.el.style.top = this.rb.toPixel(y);
            this.el.style.width = this.rb.toPixel(width);
            this.el.style.height = this.rb.toPixel(height);
        }
        // update inner text element size
        let contentSize = this.getContentSize(width, height, this.getStyle());
        this.elContentText.style.width = this.rb.toPixel(contentSize.width);
        this.elContentText.style.height = this.rb.toPixel(contentSize.height);
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
        let style = this.getStyle();
        let borderStyle, borderWidth = '', borderColor = '';
        let contentSize = this.getContentSize(this.getDisplayWidth(), this.getDisplayHeight(), style);
        styleProperties['width'] = this.rb.toPixel(contentSize.width);
        styleProperties['height'] = this.rb.toPixel(contentSize.height);
        let horizontalAlignment = style.getValue('horizontalAlignment');
        let verticalAlignment = style.getValue('verticalAlignment');
        let alignClass = 'rbroDocElementAlign' +
            horizontalAlignment.charAt(0).toUpperCase() + horizontalAlignment.slice(1);
        let valignClass = 'rbroDocElementVAlign' +
            verticalAlignment.charAt(0).toUpperCase() + verticalAlignment.slice(1);
        styleProperties['vertical-align'] = verticalAlignment;
        styleProperties['background-color'] = style.getValue('backgroundColor');
        if (!this.richText) {
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
            styleProperties['text-align'] = horizontalAlignment;
            styleProperties['color'] = style.getValue('textColor');
            styleProperties['font-family'] = style.getValue('font');
            styleProperties['font-size'] = style.getValue('fontSize') + 'px';
        } else {
            // attributes are set by rich text content itself
            styleProperties['font-weight'] = 'unset';
            styleProperties['font-style'] = 'normal';
            styleProperties['text-decoration'] = 'none';
            styleProperties['text-align'] = 'unset';
            styleProperties['color'] = '#000000';
            styleProperties['font-family'] = this.rb.getProperty('defaultFont');
            styleProperties['font-size'] = '12px';
        }
        styleProperties['line-height'] = style.getValue('lineSpacing');
        if (style.getValue('borderLeft') || style.getValue('borderTop') ||
                style.getValue('borderRight') || style.getValue('borderBottom')) {
            borderStyle = style.getValue('borderTop') ? 'solid' : 'none';
            borderStyle += style.getValue('borderRight') ? ' solid' : ' none';
            borderStyle += style.getValue('borderBottom') ? ' solid' : ' none';
            borderStyle += style.getValue('borderLeft') ? ' solid' : ' none';
            borderWidth = style.getValue('borderWidthVal') + 'px';
            borderColor = style.getValue('borderColor');
        } else {
            borderStyle = 'none';
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
        this.elContent.style.borderStyle = borderStyle;
        this.elContent.style.borderWidth = borderWidth;
        this.elContent.style.borderColor = borderColor;
        this.elContent.className = '';
        this.elContent.classList.add('rbroContentContainerHelper');
        this.elContent.classList.add(alignClass);
        this.elContent.classList.add(valignClass);
        let cssText = '';
        for (const styleName in styleProperties) {
            cssText += styleName + ': ' + styleProperties[styleName] + ';';
        }
        this.elContentText.style.cssText = cssText;
    }

    hasBorderSettings() {
        return true;
    }

    createElement() {
        this.el = utils.createElement('div', { id: `rbro_el${this.id}`, class: 'rbroDocElement rbroTextElement' });
        this.elContent = utils.createElement(
            'div', { id: `rbro_el_content${this.id}`, class: 'rbroContentContainerHelper' });
        this.elContentText = utils.createElement(
            'div', { id: `rbro_el_content_text${this.id}`, class: 'rbroDocElementContentText' });
        this.elContentTextData = utils.createElement('span', { id: `rbro_el_content_text_data${this.id}` });

        // rbroContentContainerHelper contains border styles and alignment classes
        // rbroDocElementContentText contains specific styles
        // span is needed to preserve whitespaces and word-wrap of actual text content
        this.elContentText.append(this.elContentTextData);
        this.elContent.append(this.elContentText);
        this.el.append(this.elContent);

        this.appendToContainer();
        this.elContentTextData.textContent =  this.content;
        super.registerEventHandlers();
    }

    updateContent(value) {
        if (value.trim() === '') {
            this.name = this.rb.getLabel('docElementText');
        } else {
            this.name = value;
        }
        const elMenuItemName = document.getElementById(`rbro_menu_item_name${this.id}`);
        elMenuItemName.textContent = this.name;
        elMenuItemName.setAttribute('title', this.name);
        this.elContentTextData.textContent = value;
    }

    updateRichTextContent(delta) {
        let text = '';
        if (delta && delta.ops) {
            for (let op of delta.ops) {
                if ('insert' in op) {
                    text += op.insert;
                }
            }
            // remove line breaks
            text = text.replace(/(?:\r\n|\r|\n)/g, ' ');
            // truncate text if it is too long
            if (text.length > 80) {
                text = text.substring(0, 80);
            }
            text = text.trim();
        }
        if (text === '') {
            this.name = this.rb.getLabel('docElementText');
        } else {
            this.name = text;
        }
        const elMenuItemName = document.getElementById(`rbro_menu_item_name${this.id}`);
        elMenuItemName.textContent = this.name;
        elMenuItemName.setAttribute('title', this.name);
    }

    /**
     * Sets name of this element and html using rich text.
     *
     */
    setupRichText() {
        this.updateRichTextContent(this.richTextContent);
        this.elContentTextData.innerHTML = this.richTextHtml;
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
        this.addCommandForChangedParameterName(parameter, newParameterName, 'richTextContent', cmdGroup);
        this.addCommandForChangedParameterName(parameter, newParameterName, 'richTextHtml', cmdGroup);
        this.addCommandForChangedParameterName(parameter, newParameterName, 'printIf', cmdGroup);
        this.addCommandForChangedParameterName(parameter, newParameterName, 'cs_condition', cmdGroup);
    }

    toJS() {
        const rv = super.toJS();
        const numericFields = ['borderWidth', 'paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom'];
        // watermark text does not have conditional style properties
        if (this.getElementType() !== DocElement.type.watermarkText) {
            numericFields.push('cs_paddingLeft', 'cs_paddingTop', 'cs_paddingRight', 'cs_paddingBottom');
        }
        for (const field of numericFields) {
            rv[field] = utils.convertInputToNumber(this.getValue(field));
        }
        return rv;
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
