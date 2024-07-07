import PanelBase from './PanelBase';
import CommandGroupCmd from '../commands/CommandGroupCmd';
import SetValueCmd from '../commands/SetValueCmd';
import Style from '../data/Style';
import DocElement from '../elements/DocElement';
import TableElement from '../elements/TableElement';
import * as utils from '../utils';

/**
 * Panel to edit all style properties.
 * @class
 */
export default class StylePanel extends PanelBase {
    constructor(rootElement, rb) {
        super('rbro_style', Style, rootElement, rb);

        this.propertyDescriptors = {
            'name': {
                'type': SetValueCmd.type.text,
                'fieldId': 'name'
            },
            'type': {
                'type': SetValueCmd.type.select,
                'fieldId': 'type'
            },
            'bold': {
                'type': SetValueCmd.type.button,
                'fieldId': 'bold',
                'rowId': 'rbro_style_textstyle_row',
                'singleRowProperty': false,
                'rowProperties': ['bold', 'italic', 'underline', 'strikethrough'],
                'visibleIf': "type == 'text'",
            },
            'italic': {
                'type': SetValueCmd.type.button,
                'fieldId': 'italic',
                'rowId': 'rbro_style_textstyle_row',
                'singleRowProperty': false,
                'rowProperties': ['bold', 'italic', 'underline', 'strikethrough'],
                'visibleIf': "type == 'text'",
            },
            'underline': {
                'type': SetValueCmd.type.button,
                'fieldId': 'underline',
                'rowId': 'rbro_style_textstyle_row',
                'singleRowProperty': false,
                'rowProperties': ['bold', 'italic', 'underline', 'strikethrough'],
                'visibleIf': "type == 'text'",
            },
            'strikethrough': {
                'type': SetValueCmd.type.button,
                'fieldId': 'strikethrough',
                'rowId': 'rbro_style_textstyle_row',
                'singleRowProperty': false,
                'rowProperties': ['bold', 'italic', 'underline', 'strikethrough'],
                'visibleIf': "type == 'text'",
            },
            'horizontalAlignment': {
                'type': SetValueCmd.type.buttonGroup,
                'fieldId': 'halignment',
                'rowId': 'rbro_style_alignment_row',
                'singleRowProperty': false,
                'rowProperties': ['horizontalAlignment', 'verticalAlignment'],
                'visibleIf': "type == 'text' || type == 'image'",
            },
            'verticalAlignment': {
                'type': SetValueCmd.type.buttonGroup,
                'fieldId': 'valignment',
                'rowId': 'rbro_style_alignment_row',
                'singleRowProperty': false,
                'visibleIf': "type == 'text' || type == 'image'",
            },
            'color': {
                'type': SetValueCmd.type.color,
                'allowEmpty': false,
                'fieldId': 'color',
                'visibleIf': "type == 'line'",
            },
            'textColor': {
                'type': SetValueCmd.type.color,
                'allowEmpty': false,
                'fieldId': 'text_color',
                'visibleIf': "type == 'text'",
            },
            'backgroundColor': {
                'type': SetValueCmd.type.color,
                'allowEmpty': true,
                'fieldId': 'background_color',
                'visibleIf': "type == 'text' || type == 'image' || type == 'tableBand' || type == 'frame' || type == 'sectionBand'",
            },
            'alternateBackgroundColor': {
                'type': SetValueCmd.type.color,
                'allowEmpty': true,
                'fieldId': 'alternate_background_color',
                'visibleIf': "type == 'tableBand' || type == 'sectionBand'",
            },
            'font': {
                'type': SetValueCmd.type.select,
                'fieldId': 'font',
                'rowId': 'rbro_style_font_row',
                'singleRowProperty': false,
                'rowProperties': ['font', 'fontSize'],
                'visibleIf': "type == 'text'",
            },
            'fontSize': {
                'type': SetValueCmd.type.select,
                'fieldId': 'font_size',
                'rowId': 'rbro_style_font_row',
                'singleRowProperty': false,
                'visibleIf': "type == 'text'",
            },
            'lineSpacing': {
                'type': SetValueCmd.type.select,
                'fieldId': 'line_spacing',
                'visibleIf': "type == 'text'",
            },
            'borderAll': {
                'type': SetValueCmd.type.button,
                'fieldId': 'border_all',
                'rowId': 'rbro_style_border_row',
                'singleRowProperty': false,
                'rowProperties': ['borderAll', 'borderLeft', 'borderTop', 'borderRight', 'borderBottom'],
                'visibleIf': "type == 'text' || type == 'frame'",
            },
            'borderLeft': {
                'type': SetValueCmd.type.button,
                'fieldId': 'border_left',
                'rowId': 'rbro_style_border_row',
                'singleRowProperty': false,
                'visibleIf': "type == 'text' || type == 'frame'",
            },
            'borderTop': {
                'type': SetValueCmd.type.button,
                'fieldId': 'border_top',
                'rowId': 'rbro_style_border_row',
                'singleRowProperty': false,
                'visibleIf': "type == 'text' || type == 'frame'",
            },
            'borderRight': {
                'type': SetValueCmd.type.button,
                'fieldId': 'border_right',
                'rowId': 'rbro_style_border_row',
                'singleRowProperty': false,
                'visibleIf': "type == 'text' || type == 'frame'",
            },
            'borderBottom': {
                'type': SetValueCmd.type.button,
                'fieldId': 'border_bottom',
                'rowId': 'rbro_style_border_row',
                'singleRowProperty': false,
                'visibleIf': "type == 'text' || type == 'frame'",
            },
            'border': {
                'type': SetValueCmd.type.buttonGroup,
                'fieldId': 'table_border',
                'rowId': 'rbro_style_table_border_row',
                'visibleIf': "type == 'table'",
            },
            'borderColor': {
                'type': SetValueCmd.type.color,
                'allowEmpty': false,
                'fieldId': 'border_color',
                'visibleIf': "type == 'text' || type == 'table' || type == 'frame'",
            },
            'borderWidth': {
                'type': SetValueCmd.type.text,
                'fieldId': 'border_width',
                'visibleIf': "type == 'text' || type == 'table' || type == 'frame'",
            },
            'paddingLeft': {
                'type': SetValueCmd.type.text,
                'fieldId': 'padding_left',
                'rowId': 'rbro_style_padding_row',
                'singleRowProperty': false,
                'rowProperties': ['paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom'],
                'visibleIf': "type == 'text'",
            },
            'paddingTop': {
                'type': SetValueCmd.type.text,
                'fieldId': 'padding_top',
                'rowId': 'rbro_style_padding_row',
                'singleRowProperty': false,
                'visibleIf': "type == 'text'",
            },
            'paddingRight': {
                'type': SetValueCmd.type.text,
                'fieldId': 'padding_right',
                'rowId': 'rbro_style_padding_row',
                'singleRowProperty': false,
                'visibleIf': "type == 'text'",
            },
            'paddingBottom': {
                'type': SetValueCmd.type.text,
                'fieldId': 'padding_bottom',
                'rowId': 'rbro_style_padding_row',
                'singleRowProperty': false,
                'visibleIf': "type == 'text'",
            }
        };

        super.initVisibleIfFields();
    }

    render() {
        let panel = utils.createElement('div', { id: 'rbro_style_panel', class: 'rbroHidden' });
        let elDiv = utils.createElement('div', { id: 'rbro_style_name_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('styleName'), 'rbro_style_name');
        let elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elStyleName = utils.createElement('input', { id: 'rbro_style_name', autocomplete: 'off' });
        elStyleName.addEventListener('input', (event) => {
            let obj = this.rb.getSelectedObject();
            if (obj !== null) {
                if (elStyleName.value.trim() !== '') {
                    this.rb.executeCommand(new SetValueCmd(
                        obj.getId(), 'name', elStyleName.value, SetValueCmd.type.text, this.rb));
                } else {
                    elStyleName.value = obj.getName();
                }
            }
        });
        elFormField.append(elStyleName);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_style_type_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('styleType'), 'rbro_style_type');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elStyleType = utils.createElement('select', { id: 'rbro_style_type' });
        elStyleType.append(
          utils.createElement('option', { value: Style.type.text }, this.rb.getLabel('styleTypeText')));
        elStyleType.append(
          utils.createElement('option', { value: Style.type.line }, this.rb.getLabel('styleTypeLine')));
        elStyleType.append(
          utils.createElement('option', { value: Style.type.image }, this.rb.getLabel('styleTypeImage')));
        elStyleType.append(
          utils.createElement('option', { value: Style.type.table }, this.rb.getLabel('styleTypeTable')));
        elStyleType.append(utils.createElement(
          'option', { value: Style.type.tableBand }, this.rb.getLabel('styleTypeTableBand')));
        elStyleType.append(
          utils.createElement('option', { value: Style.type.frame }, this.rb.getLabel('styleTypeFrame')));
        elStyleType.append(utils.createElement(
          'option', { value: Style.type.sectionBand }, this.rb.getLabel('styleTypeSectionBand')));
        elStyleType.addEventListener('change', (event) => {
            let obj = this.rb.getSelectedObject();
            if (obj !== null) {
                this.rb.executeCommand(new SetValueCmd(
                    obj.getId(), 'type', elStyleType.value, SetValueCmd.type.select, this.rb));
            }
        });
        elFormField.append(elStyleType);
        elDiv.append(elFormField);
        panel.append(elDiv);

        StylePanel.renderStyle(panel, 'style_', '', false, this.controls, this.rb);

        document.getElementById('rbro_detail_panel').append(panel);
    }

    static renderStyle(elPanel, idPrefix, fieldPrefix, renderDocElementMainStyle, controls, rb) {
        let elDiv, elFormField;
        elDiv = utils.createElement('div', { id: `rbro_${idPrefix}textstyle_row`, class: 'rbroFormRow' });
        utils.appendLabel(elDiv, rb.getLabel('styleTextStyle'));
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elTextStyle = utils.createElement('div', { id: `rbro_${idPrefix}textstyle` });
        let elBold = utils.createElement(
            'button', {
                id: `rbro_${idPrefix}bold`,
                class: 'rbroButton rbroActionButton rbroIcon-bold',
                type: 'button',
                title: rb.getLabel('styleBold')
            });
        elBold.addEventListener('click', (event) => {
            const val = !elBold.classList.contains('rbroButtonActive');
            this.executeCommandsForChangedProperty('bold', val, SetValueCmd.type.button, fieldPrefix, rb);
        });
        elTextStyle.append(elBold);
        let elItalic = utils.createElement(
            'button', {
                id: `rbro_${idPrefix}italic`,
                class: 'rbroButton rbroActionButton rbroIcon-italic',
                type: 'button',
                title: rb.getLabel('styleItalic')
            });
        elItalic.addEventListener('click', (event) => {
            const val = !elItalic.classList.contains('rbroButtonActive');
            this.executeCommandsForChangedProperty('italic', val, SetValueCmd.type.button, fieldPrefix, rb);
        });
        elTextStyle.append(elItalic);
        let elUnderline = utils.createElement(
            'button', {
                id: `rbro_${idPrefix}underline`,
                class: 'rbroButton rbroActionButton rbroIcon-underline',
                type: 'button',
                title: rb.getLabel('styleUnderline')
            });
        elUnderline.addEventListener('click', (event) => {
            const val = !elUnderline.classList.contains('rbroButtonActive');
            this.executeCommandsForChangedProperty('underline', val, SetValueCmd.type.button, fieldPrefix, rb);
        });
        elTextStyle.append(elUnderline);
        let elStrikethrough = utils.createElement(
            'button', {
                id: `rbro_${idPrefix}strikethrough`,
                class: 'rbroButton rbroActionButton rbroIcon-strikethrough',
                type: 'button',
                title: rb.getLabel('styleStrikethrough')
            });
        elStrikethrough.addEventListener('click', (event) => {
            const val = !elStrikethrough.classList.contains('rbroButtonActive');
            this.executeCommandsForChangedProperty('strikethrough', val, SetValueCmd.type.button, fieldPrefix, rb);
        });
        elTextStyle.append(elStrikethrough);
        elFormField.append(elTextStyle);
        elDiv.append(elFormField);
        elPanel.append(elDiv);

        elDiv = utils.createElement('div', { id: `rbro_${idPrefix}alignment_row`, class: 'rbroFormRow' });
        utils.appendLabel(elDiv, rb.getLabel('styleAlignment'));
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elHAlignment = utils.createElement('div', { id: `rbro_${idPrefix}halignment` });
        let elHAlignmentLeft = utils.createElement(
            'button', {
                id: `rbro_${idPrefix}halignment_left`,
                class: 'rbroButton rbroActionButton rbroIcon-text-align-left',
                type: 'button',
                value: 'left',
                title: rb.getLabel('styleHAlignmentLeft')
            });
        elHAlignmentLeft.addEventListener('click', (event) => {
            const val = Style.alignment.left;
            const selectedObjects = rb.getSelectedObjects();
            let valueChanged = false;
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                if (selectedObjects[i].getValue(`${fieldPrefix}horizontalAlignment`) !== val) {
                    valueChanged = true;
                    break;
                }
            }

            if (valueChanged) {
                this.executeCommandsForChangedProperty(
                    'horizontalAlignment', val, SetValueCmd.type.buttonGroup, fieldPrefix, rb);
            }
        });
        elHAlignment.append(elHAlignmentLeft);
        let elHAlignmentCenter = utils.createElement(
            'button', {
                id: `rbro_${idPrefix}halignment_center`,
                class: 'rbroButton rbroActionButton rbroIcon-text-align-center',
                type: 'button',
                value: 'center',
                title: rb.getLabel('styleHAlignmentCenter')
            });
        elHAlignmentCenter.addEventListener('click', (event) => {
            const val = Style.alignment.center;
            const selectedObjects = rb.getSelectedObjects();
            let valueChanged = false;
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                if (selectedObjects[i].getValue(`${fieldPrefix}horizontalAlignment`) !== val) {
                    valueChanged = true;
                    break;
                }
            }

            if (valueChanged) {
                this.executeCommandsForChangedProperty(
                    'horizontalAlignment', val, SetValueCmd.type.buttonGroup, fieldPrefix, rb);
            }
        });
        elHAlignment.append(elHAlignmentCenter);
        let elHAlignmentRight = utils.createElement(
            'button', {
                id: `rbro_${idPrefix}halignment_right`,
                class: 'rbroButton rbroActionButton rbroIcon-text-align-right',
                type: 'button',
                value: 'right',
                title: rb.getLabel('styleHAlignmentRight')
            });
        elHAlignmentRight.addEventListener('click', (event) => {
            const val = Style.alignment.right;
            const selectedObjects = rb.getSelectedObjects();
            let valueChanged = false;
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                if (selectedObjects[i].getValue(`${fieldPrefix}horizontalAlignment`) !== val) {
                    valueChanged = true;
                    break;
                }
            }

            if (valueChanged) {
                this.executeCommandsForChangedProperty(
                    'horizontalAlignment', val, SetValueCmd.type.buttonGroup, fieldPrefix, rb);
            }
        });
        elHAlignment.append(elHAlignmentRight);
        let elHAlignmentJustify = utils.createElement(
            'button', {
                id: `rbro_${idPrefix}halignment_justify`,
                class: 'rbroButton rbroActionButton rbroIcon-text-align-justify',
                type: 'button',
                value: 'justify',
                title: rb.getLabel('styleHAlignmentJustify')
            });
        elHAlignmentJustify.addEventListener('click', (event) => {
            const val = Style.alignment.justify;
            const selectedObjects = rb.getSelectedObjects();
            let valueChanged = false;
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                if (selectedObjects[i].getValue(`${fieldPrefix}horizontalAlignment`) !== val) {
                    valueChanged = true;
                    break;
                }
            }

            if (valueChanged) {
                this.executeCommandsForChangedProperty(
                    'horizontalAlignment', val, SetValueCmd.type.buttonGroup, fieldPrefix, rb);
            }
        });
        elHAlignment.append(elHAlignmentJustify);
        elFormField.append(elHAlignment);

        let elVAlignment = utils.createElement('div', { id: `rbro_${idPrefix}valignment` });
        let elVAlignmentTop = utils.createElement(
            'button', {
                id: `rbro_${idPrefix}valignment_top`,
                class: 'rbroButton rbroActionButton rbroIcon-align-top',
                type: 'button',
                value: 'top',
                title: rb.getLabel('styleVAlignmentTop')
            });
        elVAlignmentTop.addEventListener('click', (event) => {
            const val = Style.alignment.top;
            const selectedObjects = rb.getSelectedObjects();
            let valueChanged = false;
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                if (selectedObjects[i].getValue(`${fieldPrefix}verticalAlignment`) !== val) {
                    valueChanged = true;
                    break;
                }
            }

            if (valueChanged) {
                this.executeCommandsForChangedProperty(
                    'verticalAlignment', val, SetValueCmd.type.buttonGroup, fieldPrefix, rb);
            }
        });
        elVAlignment.append(elVAlignmentTop);
        let elVAlignmentMiddle = utils.createElement(
            'button', {
                id: `rbro_${idPrefix}valignment_middle`,
                class: 'rbroButton rbroActionButton rbroIcon-align-middle',
                type: 'button',
                value: 'middle',
                title: rb.getLabel('styleVAlignmentMiddle')
            });
        elVAlignmentMiddle.addEventListener('click', (event) => {
            const val = Style.alignment.middle;
            const selectedObjects = rb.getSelectedObjects();
            let valueChanged = false;
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                if (selectedObjects[i].getValue(`${fieldPrefix}verticalAlignment`) !== val) {
                    valueChanged = true;
                    break;
                }
            }

            if (valueChanged) {
                this.executeCommandsForChangedProperty(
                    'verticalAlignment', val, SetValueCmd.type.buttonGroup, fieldPrefix, rb);
            }
        });
        elVAlignment.append(elVAlignmentMiddle);
        let elVAlignmentBottom = utils.createElement(
            'button', {
                id: `rbro_${idPrefix}valignment_bottom`,
                class: 'rbroButton rbroActionButton rbroIcon-align-bottom',
                type: 'button',
                value: 'bottom',
                title: rb.getLabel('styleVAlignmentBottom')
            });
        elVAlignmentBottom.addEventListener('click', (event) => {
            const val = Style.alignment.bottom;
            const selectedObjects = rb.getSelectedObjects();
            let valueChanged = false;
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                if (selectedObjects[i].getValue(`${fieldPrefix}verticalAlignment`) !== val) {
                    valueChanged = true;
                    break;
                }
            }

            if (valueChanged) {
                this.executeCommandsForChangedProperty(
                    'verticalAlignment', val, SetValueCmd.type.buttonGroup, fieldPrefix, rb);
            }
        });
        elVAlignment.append(elVAlignmentBottom);
        elFormField.append(elVAlignment);
        elDiv.append(elFormField);
        elPanel.append(elDiv);

        elDiv = utils.createElement('div', { id: `rbro_${idPrefix}color_row`, class: 'rbroFormRow' });
        utils.appendLabel(elDiv, rb.getLabel('docElementColor'), `rbro_${idPrefix}color`);
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elColorContainer = utils.createElement('div', { class: 'rbroColorPickerContainer' });
        let elColor = utils.createElement('input', { id: `rbro_${idPrefix}color`, autocomplete: 'off' });
        elColor.addEventListener('change', (event) => {
            const val = elColor.value;
            if (utils.isValidColor(val)) {
                this.executeCommandsForChangedProperty('color', val, SetValueCmd.type.color, fieldPrefix, rb);
            }
        });
        elColorContainer.append(elColor);
        controls['color'] = utils.createColorPicker(elColorContainer, elColor, false, rb);
        elFormField.append(elColorContainer);
        elDiv.append(elFormField);
        elPanel.append(elDiv);

        elDiv = utils.createElement('div', { id: `rbro_${idPrefix}text_color_row`, class: 'rbroFormRow' });
        utils.appendLabel(elDiv, rb.getLabel('styleTextColor'), `rbro_${idPrefix}text_color`);
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elTextColorContainer = utils.createElement('div', { class: 'rbroColorPickerContainer' });
        let elTextColor = utils.createElement('input', { id: `rbro_${idPrefix}text_color`, autocomplete: 'off' });
        elTextColor.addEventListener('change', (event) => {
            const val = elTextColor.value;
            if (utils.isValidColor(val)) {
                this.executeCommandsForChangedProperty('textColor', val, SetValueCmd.type.color, fieldPrefix, rb);
            }
        });
        elTextColorContainer.append(elTextColor);
        controls[fieldPrefix + 'textColor'] = utils.createColorPicker(elTextColorContainer, elTextColor, false, rb);
        elFormField.append(elTextColorContainer);
        elDiv.append(elFormField);
        elPanel.append(elDiv);

        elDiv = utils.createElement('div', { id: `rbro_${idPrefix}background_color_row`, class: 'rbroFormRow' });
        utils.appendLabel(elDiv, rb.getLabel('styleBackgroundColor'), `rbro_${idPrefix}background_color`);
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elBgColorContainer = utils.createElement('div', { class: 'rbroColorPickerContainer' });
        let elBgColor = utils.createElement('input', { id: `rbro_${idPrefix}background_color`, autocomplete: 'off' });
        elBgColor.addEventListener('change', (event) => {
            const val = elBgColor.value;
            if (utils.isValidColor(val)) {
                this.executeCommandsForChangedProperty('backgroundColor', val, SetValueCmd.type.color, fieldPrefix, rb);
            }
        });
        elBgColorContainer.append(elBgColor);
        controls[fieldPrefix + 'backgroundColor'] = utils.createColorPicker(elBgColorContainer, elBgColor, true, rb);
        elFormField.append(elBgColorContainer);
        elDiv.append(elFormField);
        elPanel.append(elDiv);

        elDiv = utils.createElement(
            'div', { id: `rbro_${idPrefix}alternate_background_color_row`, class: 'rbroFormRow' });
        utils.appendLabel(
            elDiv, rb.getLabel('docElementAlternateBackgroundColor'),
            `rbro_${idPrefix}alternate_background_color`);
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elAlternateBgColorContainer = utils.createElement('div', { class: 'rbroColorPickerContainer' });
        let elAlternateBgColor = utils.createElement('input', { id: `rbro_${idPrefix}alternate_background_color` });
        elAlternateBgColor.addEventListener('change', (event) => {
            const val = elAlternateBgColor.value;
            if (utils.isValidColor(val)) {
                this.executeCommandsForChangedProperty(
                    'alternateBackgroundColor', val, SetValueCmd.type.color, fieldPrefix, rb);
            }
        });
        elAlternateBgColorContainer.append(elAlternateBgColor);
        controls[fieldPrefix + 'alternateBackgroundColor'] = utils.createColorPicker(
            elAlternateBgColorContainer, elAlternateBgColor, true, rb);
        elFormField.append(elAlternateBgColorContainer);
        elDiv.append(elFormField);
        elPanel.append(elDiv);

        elDiv = utils.createElement('div', { id: `rbro_${idPrefix}font_row`, class: 'rbroFormRow' });
        utils.appendLabel(elDiv, rb.getLabel('styleFont'), `rbro_${idPrefix}font`);
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elSplit = utils.createElement('div', { class: 'rbroSplit rbroSelectFont' });
        let elFont = utils.createElement('select', { id: `rbro_${idPrefix}font` });
        for (let font of rb.getFonts()) {
            elFont.append(utils.createElement('option', { value: font.value }, font.name));
        }
        elFont.addEventListener('change', (event) => {
            const val = elFont.value;
            this.executeCommandsForChangedProperty('font', val, SetValueCmd.type.select, fieldPrefix, rb);
        });
        elSplit.append(elFont);
        let elFontSize = utils.createElement('select', { id: `rbro_${idPrefix}font_size` });
        for (let size of rb.getProperty('fontSizes')) {
            elFontSize.append(utils.createElement('option', { value: size }, String(size)));
        }
        elFontSize.addEventListener('change', (event) => {
            const val = elFontSize.value;
            this.executeCommandsForChangedProperty('fontSize', val, SetValueCmd.type.select, fieldPrefix, rb);
        });
        elSplit.append(elFontSize);
        elSplit.append(utils.createElement('span', {}, rb.getLabel('styleFontSizeUnit')));
        elFormField.append(elSplit);
        elFormField.append(utils.createElement('div', { id: `rbro_${idPrefix}font_error`, class: 'rbroErrorMessage' }));
        elDiv.append(elFormField);
        elPanel.append(elDiv);

        elDiv = utils.createElement('div', { id: `rbro_${idPrefix}line_spacing_row`, class: 'rbroFormRow' });
        utils.appendLabel(elDiv, rb.getLabel('styleLineSpacing'), `rbro_${idPrefix}line_spacing`);
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elLineSpacing = utils.createElement('select', { id: `rbro_${idPrefix}line_spacing` });
        for (const lineSpacing of ['1', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '2']) {
            elLineSpacing.append(utils.createElement('option', { value: lineSpacing }, lineSpacing));
        }
        elLineSpacing.addEventListener('change', (event) => {
            const val = elLineSpacing.value;
            this.executeCommandsForChangedProperty('lineSpacing', val, SetValueCmd.type.select, fieldPrefix, rb);
        });
        elFormField.append(elLineSpacing);
        elDiv.append(elFormField);
        elPanel.append(elDiv);

        let elBorderDiv = utils.createElement('div', { id: `rbro_${idPrefix}border_div` });
        elDiv = utils.createElement('div', { id: `rbro_${idPrefix}border_row`, class: 'rbroFormRow' });
        utils.appendLabel(elDiv, rb.getLabel('styleBorder'));
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elBorderStyle = utils.createElement('div', { id: `rbro_${idPrefix}border` });
        let elBorderAll = utils.createElement(
            'button', {
                id: `rbro_${idPrefix}border_all`,
                class: 'rbroButton rbroActionButton rbroIcon-border-all',
                type: 'button',
                value: `${fieldPrefix}borderAll`,
                title: rb.getLabel('styleBorderAll')
            });
        elBorderAll.addEventListener('click', (event) => {
            const val = !elBorderAll.classList.contains('rbroButtonActive');
            const cmdGroup = new CommandGroupCmd('Set value', rb);
            const selectedObjects = rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), `${fieldPrefix}borderLeft`, val, SetValueCmd.type.button, rb));
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), `${fieldPrefix}borderTop`, val, SetValueCmd.type.button, rb));
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), `${fieldPrefix}borderRight`, val, SetValueCmd.type.button, rb));
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), `${fieldPrefix}borderBottom`, val, SetValueCmd.type.button, rb));

                if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                    if (obj.getValue(`${fieldPrefix}borderLeft`) !== val ||
                            obj.getValue(`${fieldPrefix}borderTop`) !== val ||
                            obj.getValue(`${fieldPrefix}borderRight`) !== val ||
                            obj.getValue(`${fieldPrefix}borderBottom`) !== val) {
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                    }
                } else if (obj instanceof Style) {
                    obj.addCommandsForChangedProperty(
                        'borderLeft', val, SetValueCmd.type.button, cmdGroup);
                    obj.addCommandsForChangedProperty(
                        'borderTop', val, SetValueCmd.type.button, cmdGroup);
                    obj.addCommandsForChangedProperty(
                        'borderRight', val, SetValueCmd.type.button, cmdGroup);
                    obj.addCommandsForChangedProperty(
                        'borderBottom', val, SetValueCmd.type.button, cmdGroup);
                }
            }
            if (!cmdGroup.isEmpty()) {
                rb.executeCommand(cmdGroup);
            }
        });
        elBorderStyle.append(elBorderAll);
        let elBorderLeft = utils.createElement(
            'button', {
                id: `rbro_${idPrefix}border_left`,
                class: 'rbroButton rbroActionButton rbroIcon-border-left',
                type: 'button',
                value: `${fieldPrefix}borderLeft`,
                title: rb.getLabel('orientationLeft')
            });
        elBorderLeft.addEventListener('click', (event) => {
            const val = !elBorderLeft.classList.contains('rbroButtonActive');
            this.executeCommandsForChangedProperty('borderLeft', val, SetValueCmd.type.button, fieldPrefix, rb);
        });
        elBorderStyle.append(elBorderLeft);
        let elBorderTop = utils.createElement(
            'button', {
                id: `rbro_${idPrefix}border_top`,
                class: 'rbroButton rbroActionButton rbroIcon-border-top',
                type: 'button',
                value: `${fieldPrefix}borderTop`,
                title: rb.getLabel('orientationTop')
            });
        elBorderTop.addEventListener('click', (event) => {
            const val = !elBorderTop.classList.contains('rbroButtonActive');
            this.executeCommandsForChangedProperty('borderTop', val, SetValueCmd.type.button, fieldPrefix, rb);
        });
        elBorderStyle.append(elBorderTop);
        let elBorderRight = utils.createElement(
            'button', {
                id: `rbro_${idPrefix}border_right`,
                class: 'rbroButton rbroActionButton rbroIcon-border-right',
                type: 'button',
                value: `${fieldPrefix}borderRight`,
                title: rb.getLabel('orientationRight')
            });
        elBorderRight.addEventListener('click', (event) => {
            const val = !elBorderRight.classList.contains('rbroButtonActive');
            this.executeCommandsForChangedProperty('borderRight', val, SetValueCmd.type.button, fieldPrefix, rb);
        });
        elBorderStyle.append(elBorderRight);
        let elBorderBottom = utils.createElement(
            'button', {
                id: `rbro_${idPrefix}border_bottom`,
                class: 'rbroButton rbroActionButton rbroIcon-border-bottom',
                type: 'button',
                value: `${fieldPrefix}borderBottom`,
                title: rb.getLabel('orientationBottom')
            });
        elBorderBottom.addEventListener('click', (event) => {
            const val = !elBorderBottom.classList.contains('rbroButtonActive');
            this.executeCommandsForChangedProperty('borderBottom', val, SetValueCmd.type.button, fieldPrefix, rb);
        });
        elBorderStyle.append(elBorderBottom);
        elFormField.append(elBorderStyle);
        elDiv.append(elFormField);
        elBorderDiv.append(elDiv);

        elDiv = utils.createElement('div', { id: `rbro_${idPrefix}table_border_row`, class: 'rbroFormRow' });
        utils.appendLabel(elDiv, rb.getLabel('styleBorder'));
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elBorder = utils.createElement('div', { id: `rbro_${idPrefix}table_border` });
        let elBorderGrid = utils.createElement(
            'button', {
                id: `rbro_${idPrefix}table_border_grid`,
                class: 'rbroButton rbroActionButton rbroIcon-border-table-grid',
                type: 'button',
                value: `${fieldPrefix}grid`,
                title: rb.getLabel('docElementBorderGrid')
            });
        elBorderGrid.addEventListener('click', (event) => {
            const val = TableElement.border.grid;
            const selectedObjects = rb.getSelectedObjects();
            let valueChanged = false;
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                if (selectedObjects[i].getValue(`${fieldPrefix}border`) !== val) {
                    valueChanged = true;
                    break;
                }
            }

            if (valueChanged) {
                this.executeCommandsForChangedProperty('border', val, SetValueCmd.type.buttonGroup, fieldPrefix, rb);
            }
        });
        elBorder.append(elBorderGrid);
        let elBorderFrameRow = utils.createElement(
            'button', {
                id: `rbro_${idPrefix}table_border_frame_row`,
                class: 'rbroButton rbroActionButton rbroIcon-border-table-frame-row',
                type: 'button',
                value: `${fieldPrefix}frame_row`,
                title: rb.getLabel('docElementBorderFrameRow')
            });
        elBorderFrameRow.addEventListener('click', (event) => {
            const val = TableElement.border.frameRow;
            const selectedObjects = rb.getSelectedObjects();
            let valueChanged = false;
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                if (selectedObjects[i].getValue(`${fieldPrefix}border`) !== val) {
                    valueChanged = true;
                    break;
                }
            }

            if (valueChanged) {
                this.executeCommandsForChangedProperty('border', val, SetValueCmd.type.buttonGroup, fieldPrefix, rb);
            }
        });
        elBorder.append(elBorderFrameRow);
        let elBorderFrame = utils.createElement(
            'button', {
                id: `rbro_${idPrefix}table_border_frame`,
                class: 'rbroButton rbroActionButton rbroIcon-border-table-frame',
                type: 'button',
                value: `${fieldPrefix}frame`,
                title: rb.getLabel('docElementBorderFrame')
            });
        elBorderFrame.addEventListener('click', (event) => {
            const val = TableElement.border.frame;
            const selectedObjects = rb.getSelectedObjects();
            let valueChanged = false;
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                if (selectedObjects[i].getValue(`${fieldPrefix}border`) !== val) {
                    valueChanged = true;
                    break;
                }
            }

            if (valueChanged) {
                this.executeCommandsForChangedProperty('border', val, SetValueCmd.type.buttonGroup, fieldPrefix, rb);
            }
        });
        elBorder.append(elBorderFrame);
        let elBorderRow = utils.createElement(
            'button', {
                id: `rbro_${idPrefix}table_border_row`,
                class: 'rbroButton rbroActionButton rbroIcon-border-table-row',
                type: 'button',
                value: `${fieldPrefix}row`,
                title: rb.getLabel('docElementBorderRow')
            });
        elBorderRow.addEventListener('click', (event) => {
            const val = TableElement.border.row;
            const selectedObjects = rb.getSelectedObjects();
            let valueChanged = false;
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                if (selectedObjects[i].getValue(`${fieldPrefix}border`) !== val) {
                    valueChanged = true;
                    break;
                }
            }

            if (valueChanged) {
                this.executeCommandsForChangedProperty('border', val, SetValueCmd.type.buttonGroup, fieldPrefix, rb);
            }
        });
        elBorder.append(elBorderRow);
        let elBorderNone = utils.createElement(
            'button', {
                id: `rbro_${idPrefix}table_border_none`,
                class: 'rbroButton rbroActionButton rbroIcon-border-table-none',
                type: 'button',
                value: `${fieldPrefix}none`,
                title: rb.getLabel('docElementBorderNone')
            });
        elBorderNone.addEventListener('click', (event) => {
            const val = TableElement.border.none;
            const selectedObjects = rb.getSelectedObjects();
            let valueChanged = false;
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                if (selectedObjects[i].getValue(`${fieldPrefix}border`) !== val) {
                    valueChanged = true;
                    break;
                }
            }

            if (valueChanged) {
                this.executeCommandsForChangedProperty('border', val, SetValueCmd.type.buttonGroup, fieldPrefix, rb);
            }
        });
        elBorder.append(elBorderNone);
        elFormField.append(elBorder);
        elDiv.append(elFormField);
        elBorderDiv.append(elDiv);

        elDiv = utils.createElement('div', { id: `rbro_${idPrefix}border_color_row`, class: 'rbroFormRow' });
        utils.appendLabel(elDiv, rb.getLabel('styleBorderColor'), `rbro_${idPrefix}border_color`);
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elBorderColorContainer = utils.createElement('div', { class: 'rbroColorPickerContainer' });
        let elBorderColor = utils.createElement('input', { id: `rbro_${idPrefix}border_color`, autocomplete: 'off' });
        elBorderColor.addEventListener('change', (event) => {
            const val = elBorderColor.value;
            if (utils.isValidColor(val)) {
                this.executeCommandsForChangedProperty('borderColor', val, SetValueCmd.type.color, fieldPrefix, rb);
            }
        });
        elBorderColorContainer.append(elBorderColor);
        controls[fieldPrefix + 'borderColor'] = utils.createColorPicker(
            elBorderColorContainer, elBorderColor, false, rb);
        elFormField.append(elBorderColorContainer);
        elDiv.append(elFormField);
        elBorderDiv.append(elDiv);

        elDiv = utils.createElement('div', { id: `rbro_${idPrefix}border_width_row`, class: 'rbroFormRow' });
        utils.appendLabel(elDiv, rb.getLabel('styleBorderWidth'), `rbro_${idPrefix}border_width`);
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elBorderWidth = utils.createElement(
            'input', { id: `rbro_${idPrefix}border_width`, type: 'number', step: '0.5', autocomplete: 'off' });
        elBorderWidth.addEventListener('input', (event) => {
            let val = elBorderWidth.value;
            if (val !== '') {
                val = utils.checkInputDecimal(val, 0.5, 99);
            }
            if (val !== elBorderWidth.value) {
                elBorderWidth.value = val;
            }
            const selectedObjects = rb.getSelectedObjects();
            let valueChanged = false;
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                if (selectedObjects[i].getValue(`${fieldPrefix}borderWidth`) !== val) {
                    valueChanged = true;
                    break;
                }
            }

            if (valueChanged) {
                this.executeCommandsForChangedProperty('borderWidth', val, SetValueCmd.type.text, fieldPrefix, rb);
            }
        });
        elFormField.append(elBorderWidth);
        elDiv.append(elFormField);
        elBorderDiv.append(elDiv);
        elPanel.append(elBorderDiv);

        elDiv = utils.createElement('div', { id: `rbro_${idPrefix}padding_row`, class: 'rbroFormRow' });
        utils.appendLabel(elDiv, rb.getLabel('stylePadding'), `rbro_${idPrefix}padding`);
        elFormField = utils.createElement('div', { class: 'rbroFormField rbroSmallInput' });

        let elPaddingTopDiv = utils.createElement('div', { class: 'rbroColumnCenter' });
        let elPaddingTop = utils.createElement(
            'input', { id: `rbro_${idPrefix}padding_top`, placeholder: rb.getLabel('orientationTop'),
                type: 'number', autocomplete: 'off'
            });
        elPaddingTop.addEventListener('input', (event) => {
            const val = elPaddingTop.value;
            this.executeCommandsForChangedProperty('paddingTop', val, SetValueCmd.type.text, fieldPrefix, rb);
        });
        elPaddingTopDiv.append(elPaddingTop);
        elFormField.append(elPaddingTopDiv);

        let elDiv2 = utils.createElement('div', { class: 'rbroSplit' });
        let elPaddingLeft = utils.createElement(
            'input', {
                id: `rbro_${idPrefix}padding_left`, placeholder: rb.getLabel('orientationLeft'), type: 'number',
                autocomplete: 'off'
            });
        elPaddingLeft.addEventListener('input', (event) => {
            const val = elPaddingLeft.value;
            this.executeCommandsForChangedProperty('paddingLeft', val, SetValueCmd.type.text, fieldPrefix, rb);
        });
        elDiv2.append(elPaddingLeft);
        let elPaddingRight = utils.createElement(
            'input', {
                id: `rbro_${idPrefix}padding_right`, placeholder: rb.getLabel('orientationRight'), type: 'number',
                autocomplete: 'off'
            });
        elPaddingRight.addEventListener('input', (event) => {
            const val = elPaddingRight.value;
            this.executeCommandsForChangedProperty('paddingRight', val, SetValueCmd.type.text, fieldPrefix, rb);
        });
        elDiv2.append(elPaddingRight);
        elFormField.append(elDiv2);

        let elPaddingBottomDiv = utils.createElement('div', { class: 'rbroColumnCenter' });
        let elPaddingBottom = utils.createElement(
            'input', {
                id: `rbro_${idPrefix}padding_bottom`, placeholder: rb.getLabel('orientationBottom'), type: 'number',
                autocomplete: 'off'
            });
        elPaddingBottom.addEventListener('input', (event) => {
            const val = elPaddingBottom.value;
            this.executeCommandsForChangedProperty('paddingBottom', val, SetValueCmd.type.text, fieldPrefix, rb);
        });
        elPaddingBottomDiv.append(elPaddingBottom);
        elFormField.append(elPaddingBottomDiv);
        elDiv.append(elFormField);
        elPanel.append(elDiv);
    }

    destroy() {
        StylePanel.destroyStyle('', this.controls);
    }

    /**
     * Execute commands to set changed style property value for selected objects.
     * If selected object is a style then the property value will also be set
     * for all document elements using this style.
     *
     * @param {String} field - changed field.
     * @param {Object} value - new value for given field.
     * @param {String} type - property type for SetValueCmd.
     * @param {String} fieldPrefix - prefix for field name, this is useful for additional style properties
     * of document elements (e.g. 'cs_' prefix for conditional style properties).
     * @param {ReportBro} rb - ReportBro instance.
     */
    static executeCommandsForChangedProperty(field, value, type, fieldPrefix, rb) {
        const cmdGroup = new CommandGroupCmd('Set value', rb);
        const selectedObjects = rb.getSelectedObjects();
        for (let i=selectedObjects.length - 1; i >= 0; i--) {
            const obj = selectedObjects[i];
            cmdGroup.addSelection(obj.getId());
            cmdGroup.addCommand(new SetValueCmd(
                obj.getId(), `${fieldPrefix}${field}`, value, type, rb));

            if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                if (obj.getValue(`${fieldPrefix}textColor`) !== value) {
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                }
            } else if (obj instanceof Style) {
                obj.addCommandsForChangedProperty(field, value, type, cmdGroup);
            }

        }
        if (!cmdGroup.isEmpty()) {
            rb.executeCommand(cmdGroup);
        }
    }

    static destroyStyle(fieldPrefix, controls) {
        controls[fieldPrefix + 'textColor'].destroy();
        controls[fieldPrefix + 'backgroundColor'].destroy();
        if ((fieldPrefix + 'alternateBackgroundColor') in controls) {
            // control is only created for main style
            controls[fieldPrefix + 'alternateBackgroundColor'].destroy();
        }
        controls[fieldPrefix + 'borderColor'].destroy();
    }
}
