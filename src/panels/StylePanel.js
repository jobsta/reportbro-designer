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
            'bold': {
                'type': SetValueCmd.type.button,
                'fieldId': 'bold',
                'rowId': 'rbro_style_textstyle_row',
                'singleRowProperty': false,
                'rowProperties': ['bold', 'italic', 'underline', 'strikethrough']
            },
            'italic': {
                'type': SetValueCmd.type.button,
                'fieldId': 'italic',
                'rowId': 'rbro_style_textstyle_row',
                'singleRowProperty': false,
                'rowProperties': ['bold', 'italic', 'underline', 'strikethrough']
            },
            'underline': {
                'type': SetValueCmd.type.button,
                'fieldId': 'underline',
                'rowId': 'rbro_style_textstyle_row',
                'singleRowProperty': false,
                'rowProperties': ['bold', 'italic', 'underline', 'strikethrough']
            },
            'strikethrough': {
                'type': SetValueCmd.type.button,
                'fieldId': 'strikethrough',
                'rowId': 'rbro_style_textstyle_row',
                'singleRowProperty': false,
                'rowProperties': ['bold', 'italic', 'underline', 'strikethrough']
            },
            'horizontalAlignment': {
                'type': SetValueCmd.type.buttonGroup,
                'fieldId': 'halignment',
                'rowId': 'rbro_style_alignment_row',
                'singleRowProperty': false,
                'rowProperties': ['horizontalAlignment', 'verticalAlignment']
            },
            'verticalAlignment': {
                'type': SetValueCmd.type.buttonGroup,
                'fieldId': 'valignment',
                'rowId': 'rbro_style_alignment_row',
                'singleRowProperty': false
            },
            'textColor': {
                'type': SetValueCmd.type.color,
                'allowEmpty': false,
                'fieldId': 'text_color'
            },
            'backgroundColor': {
                'type': SetValueCmd.type.color,
                'allowEmpty': true,
                'fieldId': 'background_color'
            },
            'font': {
                'type': SetValueCmd.type.select,
                'fieldId': 'font',
                'rowId': 'rbro_style_font_row',
                'singleRowProperty': false,
                'rowProperties': ['font', 'fontSize']
            },
            'fontSize': {
                'type': SetValueCmd.type.select,
                'fieldId': 'font_size',
                'rowId': 'rbro_style_font_row',
                'singleRowProperty': false
            },
            'lineSpacing': {
                'type': SetValueCmd.type.select,
                'fieldId': 'line_spacing'
            },
            'borderAll': {
                'type': SetValueCmd.type.button,
                'fieldId': 'border_all',
                'rowId': 'rbro_style_border_row',
                'singleRowProperty': false,
                'rowProperties': ['borderAll', 'borderLeft', 'borderTop', 'borderRight', 'borderBottom']
            },
            'borderLeft': {
                'type': SetValueCmd.type.button,
                'fieldId': 'border_left',
                'rowId': 'rbro_style_border_row',
                'singleRowProperty': false
            },
            'borderTop': {
                'type': SetValueCmd.type.button,
                'fieldId': 'border_top',
                'rowId': 'rbro_style_border_row',
                'singleRowProperty': false
            },
            'borderRight': {
                'type': SetValueCmd.type.button,
                'fieldId': 'border_right',
                'rowId': 'rbro_style_border_row',
                'singleRowProperty': false
            },
            'borderBottom': {
                'type': SetValueCmd.type.button,
                'fieldId': 'border_bottom',
                'rowId': 'rbro_style_border_row',
                'singleRowProperty': false
            },
            'borderColor': {
                'type': SetValueCmd.type.color,
                'allowEmpty': false,
                'fieldId': 'border_color'
            },
            'borderWidth': {
                'type': SetValueCmd.type.text,
                'fieldId': 'border_width'
            },
            'paddingLeft': {
                'type': SetValueCmd.type.text,
                'fieldId': 'padding_left',
                'rowId': 'rbro_style_padding_row',
                'singleRowProperty': false,
                'rowProperties': ['paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom']
            },
            'paddingTop': {
                'type': SetValueCmd.type.text,
                'fieldId': 'padding_top',
                'rowId': 'rbro_style_padding_row',
                'singleRowProperty': false
            },
            'paddingRight': {
                'type': SetValueCmd.type.text,
                'fieldId': 'padding_right',
                'rowId': 'rbro_style_padding_row',
                'singleRowProperty': false
            },
            'paddingBottom': {
                'type': SetValueCmd.type.text,
                'fieldId': 'padding_bottom',
                'rowId': 'rbro_style_padding_row',
                'singleRowProperty': false
            }
        };
    }

    render() {
        let panel = $('<div id="rbro_style_panel" class="rbroHidden"></div>');
        let elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_style_name">${this.rb.getLabel('styleName')}:</label>`);
        let elFormField = $('<div class="rbroFormField"></div>');
        let elStyleName = $(`<input id="rbro_style_name">`)
            .on('input', event => {
                let obj = this.rb.getSelectedObject();
                if (obj !== null) {
                    if (elStyleName.val().trim() !== '') {
                        this.rb.executeCommand(new SetValueCmd(
                            obj.getId(), 'name', elStyleName.val(), SetValueCmd.type.text, this.rb));
                    } else {
                        elStyleName.val(style.getName());
                    }
                }
            });
        elFormField.append(elStyleName);
        elDiv.append(elFormField);
        panel.append(elDiv);

        StylePanel.renderStyle(panel, 'style_', '', false, this.controls, this.rb);

        $('#rbro_detail_panel').append(panel);
    }

    static renderStyle(elPanel, idPrefix, fieldPrefix, renderDocElementMainStyle, controls, rb) {
        let elDiv, elFormField;
        elDiv = $(`<div id="rbro_${idPrefix}textstyle_row" class="rbroFormRow"></div>`);
        elDiv.append(`<label>${rb.getLabel('styleTextStyle')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elTextStyle = $(`<div id="rbro_${idPrefix}textstyle"></div>`);
        let elBold = $(
            `<button id="rbro_${idPrefix}bold" name="style_bold"
             class="rbroButton rbroActionButton rbroIcon-bold" type="button"
             title="${rb.getLabel('styleBold')}"></button>`)
            .click(event => {
                let val = !elBold.hasClass('rbroButtonActive');
                let cmdGroup = new CommandGroupCmd('Set value', rb);
                let selectedObjects = rb.getSelectedObjects();
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), `${fieldPrefix}bold`, val, SetValueCmd.type.button, rb));

                    if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                        if (obj.getValue(`${fieldPrefix}bold`) !== val) {
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                        }
                    } else if (obj instanceof Style) {
                        obj.addCommandsForChangedProperty(
                            'bold', val, SetValueCmd.type.button, cmdGroup);
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    rb.executeCommand(cmdGroup);
                }
            });
        elTextStyle.append(elBold);
        let elItalic = $(
            `<button id="rbro_${idPrefix}italic"
             class="rbroButton rbroActionButton rbroIcon-italic" type="button"
             title="${rb.getLabel('styleItalic')}"></button>`)
            .click(event => {
                let val = !elItalic.hasClass('rbroButtonActive');
                let cmdGroup = new CommandGroupCmd('Set value', rb);
                let selectedObjects = rb.getSelectedObjects();
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), `${fieldPrefix}italic`, val, SetValueCmd.type.button, rb));

                    if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                        if (obj.getValue(`${fieldPrefix}italic`) !== val) {
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                        }
                    } else if (obj instanceof Style) {
                        obj.addCommandsForChangedProperty(
                            'italic', val, SetValueCmd.type.button, cmdGroup);
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    rb.executeCommand(cmdGroup);
                }
            });
        elTextStyle.append(elItalic);
        let elUnderline = $(
            `<button id="rbro_${idPrefix}underline"
             class="rbroButton rbroActionButton rbroIcon-underline" type="button"
             title="${rb.getLabel('styleUnderline')}"></button>`)
            .click(event => {
                let val = !elUnderline.hasClass('rbroButtonActive');
                let cmdGroup = new CommandGroupCmd('Set value', rb);
                let selectedObjects = rb.getSelectedObjects();
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), `${fieldPrefix}underline`, val, SetValueCmd.type.button, rb));

                    if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                        if (obj.getValue(`${fieldPrefix}underline`) !== val) {
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                        }
                    } else if (obj instanceof Style) {
                        obj.addCommandsForChangedProperty(
                            'underline', val, SetValueCmd.type.button, cmdGroup);
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    rb.executeCommand(cmdGroup);
                }
            });
        elTextStyle.append(elUnderline);
        let elStrikethrough = $(
            `<button id="rbro_${idPrefix}strikethrough"
             class="rbroButton rbroActionButton rbroIcon-strikethrough" type="button"
             title="${rb.getLabel('styleStrikethrough')}"></button>`)
            .click(event => {
                let val = !elStrikethrough.hasClass('rbroButtonActive');
                let cmdGroup = new CommandGroupCmd('Set value', rb);
                let selectedObjects = rb.getSelectedObjects();
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), `${fieldPrefix}strikethrough`, val, SetValueCmd.type.button, rb));

                    if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                        if (obj.getValue(`${fieldPrefix}strikethrough`) !== val) {
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                        }
                    } else if (obj instanceof Style) {
                        obj.addCommandsForChangedProperty(
                            'strikethrough', val, SetValueCmd.type.button, cmdGroup);
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    rb.executeCommand(cmdGroup);
                }
            });
        elTextStyle.append(elStrikethrough);
        elFormField.append(elTextStyle);
        elDiv.append(elFormField);
        elPanel.append(elDiv);

        elDiv = $(`<div id="rbro_${idPrefix}alignment_row" class="rbroFormRow"></div>`);
        elDiv.append(`<label>${rb.getLabel('styleAlignment')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elHAlignment = $(`<div id="rbro_${idPrefix}halignment"></div>`);
        let elHAlignmentLeft = $(
            `<button id="rbro_${idPrefix}halignment_left"
             class="rbroButton rbroActionButton rbroIcon-text-align-left" type="button" value="left"
             title="${rb.getLabel('styleHAlignmentLeft')}"></button>`)
            .click(event => {
                let val = Style.alignment.left;
                let selectedObjects = rb.getSelectedObjects();
                let valueChanged = false;
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    if (selectedObjects[i].getValue(`${fieldPrefix}horizontalAlignment`) !== val) {
                        valueChanged = true;
                        break;
                    }
                }

                if (valueChanged) {
                    let cmdGroup = new CommandGroupCmd('Set value', rb);
                    for (let i=selectedObjects.length - 1; i >= 0; i--) {
                        let obj = selectedObjects[i];
                        cmdGroup.addSelection(obj.getId());
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), `${fieldPrefix}horizontalAlignment`, val,
                            SetValueCmd.type.buttonGroup, rb));

                        if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                            if (obj.getValue(`${fieldPrefix}horizontalAlignment`) !== val) {
                                cmdGroup.addCommand(new SetValueCmd(
                                    obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                            }
                        } else if (obj instanceof Style) {
                            obj.addCommandsForChangedProperty(
                                'horizontalAlignment', val, SetValueCmd.type.buttonGroup, cmdGroup);
                        }
                    }
                    if (!cmdGroup.isEmpty()) {
                        rb.executeCommand(cmdGroup);
                    }
                }
            });
        elHAlignment.append(elHAlignmentLeft);
        let elHAlignmentCenter = $(
            `<button id="rbro_${idPrefix}halignment_center"
             class="rbroButton rbroActionButton rbroIcon-text-align-center" type="button" value="center"
             title="${rb.getLabel('styleHAlignmentCenter')}"></button>`)
            .click(event => {
                let val = Style.alignment.center;
                let selectedObjects = rb.getSelectedObjects();
                let valueChanged = false;
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    if (selectedObjects[i].getValue(`${fieldPrefix}horizontalAlignment`) !== val) {
                        valueChanged = true;
                        break;
                    }
                }

                if (valueChanged) {
                    let cmdGroup = new CommandGroupCmd('Set value', rb);
                    for (let i = selectedObjects.length - 1; i >= 0; i--) {
                        let obj = selectedObjects[i];
                        cmdGroup.addSelection(obj.getId());
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), `${fieldPrefix}horizontalAlignment`, val,
                            SetValueCmd.type.buttonGroup, rb));

                        if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                            if (obj.getValue(`${fieldPrefix}horizontalAlignment`) !== val) {
                                cmdGroup.addCommand(new SetValueCmd(
                                    obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                            }
                        } else if (obj instanceof Style) {
                            obj.addCommandsForChangedProperty(
                                'horizontalAlignment', val, SetValueCmd.type.buttonGroup, cmdGroup);
                        }
                    }
                    if (!cmdGroup.isEmpty()) {
                        rb.executeCommand(cmdGroup);
                    }
                }
            });
        elHAlignment.append(elHAlignmentCenter);
        let elHAlignmentRight = $(
            `<button id="rbro_${idPrefix}halignment_right"
             class="rbroButton rbroActionButton rbroIcon-text-align-right" type="button" value="right"
             title="${rb.getLabel('styleHAlignmentRight')}"></button>`)
            .click(event => {
                let val = Style.alignment.right;
                let selectedObjects = rb.getSelectedObjects();
                let valueChanged = false;
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    if (selectedObjects[i].getValue(`${fieldPrefix}horizontalAlignment`) !== val) {
                        valueChanged = true;
                        break;
                    }
                }

                if (valueChanged) {
                    let cmdGroup = new CommandGroupCmd('Set value', rb);
                    for (let i = selectedObjects.length - 1; i >= 0; i--) {
                        let obj = selectedObjects[i];
                        cmdGroup.addSelection(obj.getId());
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), `${fieldPrefix}horizontalAlignment`, val,
                            SetValueCmd.type.buttonGroup, rb));

                        if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                            if (obj.getValue(`${fieldPrefix}horizontalAlignment`) !== val) {
                                cmdGroup.addCommand(new SetValueCmd(
                                    obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                            }
                        } else if (obj instanceof Style) {
                            obj.addCommandsForChangedProperty(
                                'horizontalAlignment', val, SetValueCmd.type.buttonGroup, cmdGroup);
                        }
                    }
                    if (!cmdGroup.isEmpty()) {
                        rb.executeCommand(cmdGroup);
                    }
                }
            });
        elHAlignment.append(elHAlignmentRight);
        let elHAlignmentJustify = $(
            `<button id="rbro_${idPrefix}halignment_justify"
             class="rbroButton rbroActionButton rbroIcon-text-align-justify" type="button" value="justify"
             title="${rb.getLabel('styleHAlignmentJustify')}"></button>`)
            .click(event => {
                let val = Style.alignment.justify;
                let selectedObjects = rb.getSelectedObjects();
                let valueChanged = false;
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    if (selectedObjects[i].getValue(`${fieldPrefix}horizontalAlignment`) !== val) {
                        valueChanged = true;
                        break;
                    }
                }

                if (valueChanged) {
                    let cmdGroup = new CommandGroupCmd('Set value', rb);
                    for (let i=selectedObjects.length - 1; i >= 0; i--) {
                        let obj = selectedObjects[i];
                        cmdGroup.addSelection(obj.getId());
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), `${fieldPrefix}horizontalAlignment`, val,
                            SetValueCmd.type.buttonGroup, rb));

                        if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                            if (obj.getValue(`${fieldPrefix}horizontalAlignment`) !== val) {
                                cmdGroup.addCommand(new SetValueCmd(
                                    obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                            }
                        } else if (obj instanceof Style) {
                            obj.addCommandsForChangedProperty(
                                'horizontalAlignment', val, SetValueCmd.type.buttonGroup, cmdGroup);
                        }
                    }
                    if (!cmdGroup.isEmpty()) {
                        rb.executeCommand(cmdGroup);
                    }
                }
            });
        elHAlignment.append(elHAlignmentJustify);
        elFormField.append(elHAlignment);

        let elVAlignment = $(`<div id="rbro_${idPrefix}valignment"></div>`);
        let elVAlignmentTop = $(
            `<button id="rbro_${idPrefix}valignment_top"
             class="rbroButton rbroActionButton rbroIcon-align-top" type="button" value="top"
             title="${rb.getLabel('styleVAlignmentTop')}"></button>`)
            .click(event => {
                let val = Style.alignment.top;
                let selectedObjects = rb.getSelectedObjects();
                let valueChanged = false;
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    if (selectedObjects[i].getValue(`${fieldPrefix}verticalAlignment`) !== val) {
                        valueChanged = true;
                        break;
                    }
                }

                if (valueChanged) {
                    let cmdGroup = new CommandGroupCmd('Set value', rb);
                    for (let i = selectedObjects.length - 1; i >= 0; i--) {
                        let obj = selectedObjects[i];
                        cmdGroup.addSelection(obj.getId());
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), `${fieldPrefix}verticalAlignment`, val,
                            SetValueCmd.type.buttonGroup, rb));

                        if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                            if (obj.getValue(`${fieldPrefix}verticalAlignment`) !== val) {
                                cmdGroup.addCommand(new SetValueCmd(
                                    obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                            }
                        } else if (obj instanceof Style) {
                            obj.addCommandsForChangedProperty(
                                'verticalAlignment', val, SetValueCmd.type.buttonGroup, cmdGroup);
                        }
                    }
                    if (!cmdGroup.isEmpty()) {
                        rb.executeCommand(cmdGroup);
                    }
                }
            });
        elVAlignment.append(elVAlignmentTop);
        let elVAlignmentMiddle = $(
            `<button id="rbro_${idPrefix}valignment_middle"
             class="rbroButton rbroActionButton rbroIcon-align-middle" type="button" value="middle"
             title="${rb.getLabel('styleVAlignmentMiddle')}"></button>`)
            .click(event => {
                let val = Style.alignment.middle;
                let selectedObjects = rb.getSelectedObjects();
                let valueChanged = false;
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    if (selectedObjects[i].getValue(`${fieldPrefix}verticalAlignment`) !== val) {
                        valueChanged = true;
                        break;
                    }
                }

                if (valueChanged) {
                    let cmdGroup = new CommandGroupCmd('Set value', rb);
                    for (let i = selectedObjects.length - 1; i >= 0; i--) {
                        let obj = selectedObjects[i];
                        cmdGroup.addSelection(obj.getId());
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), `${fieldPrefix}verticalAlignment`, val,
                            SetValueCmd.type.buttonGroup, rb));

                        if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                            if (obj.getValue(`${fieldPrefix}verticalAlignment`) !== val) {
                                cmdGroup.addCommand(new SetValueCmd(
                                    obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                            }
                        } else if (obj instanceof Style) {
                            obj.addCommandsForChangedProperty(
                                'verticalAlignment', val, SetValueCmd.type.buttonGroup, cmdGroup);
                        }
                    }
                    if (!cmdGroup.isEmpty()) {
                        rb.executeCommand(cmdGroup);
                    }
                }
            });
        elVAlignment.append(elVAlignmentMiddle);
        let elVAlignmentBottom = $(
            `<button id="rbro_${idPrefix}valignment_bottom"
             class="rbroButton rbroActionButton rbroIcon-align-bottom" type="button" value="bottom"
             title="${rb.getLabel('styleVAlignmentBottom')}"></button>`)
            .click(event => {
                let val = Style.alignment.bottom;
                let selectedObjects = rb.getSelectedObjects();
                let valueChanged = false;
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    if (selectedObjects[i].getValue(`${fieldPrefix}verticalAlignment`) !== val) {
                        valueChanged = true;
                        break;
                    }
                }

                if (valueChanged) {
                    let cmdGroup = new CommandGroupCmd('Set value', rb);
                    for (let i = selectedObjects.length - 1; i >= 0; i--) {
                        let obj = selectedObjects[i];
                        cmdGroup.addSelection(obj.getId());
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), `${fieldPrefix}verticalAlignment`, val,
                            SetValueCmd.type.buttonGroup, rb));

                        if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                            if (obj.getValue(`${fieldPrefix}verticalAlignment`) !== val) {
                                cmdGroup.addCommand(new SetValueCmd(
                                    obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                            }
                        } else if (obj instanceof Style) {
                            obj.addCommandsForChangedProperty(
                                'verticalAlignment', val, SetValueCmd.type.buttonGroup, cmdGroup);
                        }
                    }
                    if (!cmdGroup.isEmpty()) {
                        rb.executeCommand(cmdGroup);
                    }
                }
            });
        elVAlignment.append(elVAlignmentBottom);
        elFormField.append(elVAlignment);
        elDiv.append(elFormField);
        elPanel.append(elDiv);

        elDiv = $(`<div id="rbro_${idPrefix}text_color_row" class="rbroFormRow"></div>`);
        elDiv.append(`<label for="rbro_${idPrefix}text_color">${rb.getLabel('styleTextColor')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elTextColorContainer = $('<div class="rbroColorPickerContainer"></div>');
        let elTextColor = $(`<input id="rbro_${idPrefix}text_color">`)
            .change(event => {
                let val = elTextColor.val();
                if (utils.isValidColor(val)) {
                    let cmdGroup = new CommandGroupCmd('Set value', rb);
                    let selectedObjects = rb.getSelectedObjects();
                    for (let i=selectedObjects.length - 1; i >= 0; i--) {
                        let obj = selectedObjects[i];
                        cmdGroup.addSelection(obj.getId());
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), `${fieldPrefix}textColor`, val, SetValueCmd.type.color, rb));

                        if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                            if (obj.getValue(`${fieldPrefix}textColor`) !== val) {
                                cmdGroup.addCommand(new SetValueCmd(
                                    obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                            }
                        } else if (obj instanceof Style) {
                            obj.addCommandsForChangedProperty(
                                'textColor', val, SetValueCmd.type.color, cmdGroup);
                        }
                    }
                    if (!cmdGroup.isEmpty()) {
                        rb.executeCommand(cmdGroup);
                    }
                }
            });
        elTextColorContainer.append(elTextColor);
        controls[fieldPrefix + 'textColor'] = utils.createColorPicker(elTextColorContainer, elTextColor, false, rb);
        elFormField.append(elTextColorContainer);
        elDiv.append(elFormField);
        elPanel.append(elDiv);

        elDiv = $(`<div id="rbro_${idPrefix}background_color_row" class="rbroFormRow"></div>`);
        elDiv.append(`<label for="rbro_${idPrefix}background_color">
                      ${rb.getLabel('styleBackgroundColor')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elBgColorContainer = $('<div class="rbroColorPickerContainer"></div>');
        let elBgColor = $(`<input id="rbro_${idPrefix}background_color">`)
            .change(event => {
                let val = elBgColor.val();
                if (utils.isValidColor(val)) {
                    let cmdGroup = new CommandGroupCmd('Set value', rb);
                    let selectedObjects = rb.getSelectedObjects();
                    for (let i=selectedObjects.length - 1; i >= 0; i--) {
                        let obj = selectedObjects[i];
                        cmdGroup.addSelection(obj.getId());
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), `${fieldPrefix}backgroundColor`, val,
                            SetValueCmd.type.color, rb));

                        if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                            if (obj.getValue(`${fieldPrefix}backgroundColor`) !== val) {
                                cmdGroup.addCommand(new SetValueCmd(
                                    obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                            }
                        } else if (obj instanceof Style) {
                            obj.addCommandsForChangedProperty(
                                'backgroundColor', val, SetValueCmd.type.color, cmdGroup);
                        }
                    }
                    if (!cmdGroup.isEmpty()) {
                        rb.executeCommand(cmdGroup);
                    }
                }
            });
        elBgColorContainer.append(elBgColor);
        controls[fieldPrefix + 'backgroundColor'] = utils.createColorPicker(elBgColorContainer, elBgColor, true, rb);
        elFormField.append(elBgColorContainer);
        elDiv.append(elFormField);
        elPanel.append(elDiv);

        if (renderDocElementMainStyle) {
            elDiv = $(`<div id="rbro_${idPrefix}alternate_background_color_row" class="rbroFormRow"></div>`);
            elDiv.append(`<label for="rbro_${idPrefix}alternate_background_color">
                          ${rb.getLabel('docElementAlternateBackgroundColor')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elAlternateBgColorContainer = $('<div class="rbroColorPickerContainer"></div>');
            let elAlternateBgColor = $(`<input id="rbro_${idPrefix}alternate_background_color">`)
                .change(event => {
                    let val = elAlternateBgColor.val();
                    if (utils.isValidColor(val)) {
                        let cmdGroup = new CommandGroupCmd('Set value', rb);
                        let selectedObjects = rb.getSelectedObjects();
                        for (let i=selectedObjects.length - 1; i >= 0; i--) {
                            let obj = selectedObjects[i];
                            cmdGroup.addSelection(obj.getId());
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), `${fieldPrefix}alternateBackgroundColor`, val,
                                SetValueCmd.type.color, rb));

                            if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                                if (obj.getValue(`${fieldPrefix}alternateBackgroundColor`) !== val) {
                                    cmdGroup.addCommand(new SetValueCmd(
                                        obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                                }
                            } else if (obj instanceof Style) {
                                obj.addCommandsForChangedProperty(
                                    'alternateBackgroundColor', val, SetValueCmd.type.color, cmdGroup);
                            }
                        }
                        if (!cmdGroup.isEmpty()) {
                            rb.executeCommand(cmdGroup);
                        }
                    }
                });
            elAlternateBgColorContainer.append(elAlternateBgColor);
            controls[fieldPrefix + 'alternateBackgroundColor'] = utils.createColorPicker(
                elAlternateBgColorContainer, elAlternateBgColor, true, rb);
            elFormField.append(elAlternateBgColorContainer);
            elDiv.append(elFormField);
            elPanel.append(elDiv);
        }

        elDiv = $(`<div id="rbro_${idPrefix}font_row" class="rbroFormRow"></div>`);
        elDiv.append(`<label for="rbro_${idPrefix}font">${rb.getLabel('styleFont')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit rbroSelectFont"></div>');
        let strFont = `<select id="rbro_${idPrefix}font">`;
        for (let font of rb.getFonts()) {
            strFont += `<option value="${font.value}">${font.name}</option>`;
        }
        strFont += '</select>';
        let elFont = $(strFont)
            .change(event => {
                let val = elFont.val();
                let cmdGroup = new CommandGroupCmd('Set value', rb);
                let selectedObjects = rb.getSelectedObjects();
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), `${fieldPrefix}font`, val, SetValueCmd.type.select, rb));

                    if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                        if (obj.getValue(`${fieldPrefix}font`) !== val) {
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                        }
                    } else if (obj instanceof Style) {
                        obj.addCommandsForChangedProperty(
                            'font', val, SetValueCmd.type.select, cmdGroup);
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    rb.executeCommand(cmdGroup);
                }
            });
        elFormField.append(elFont);
        let strFontSize = `<select id="rbro_${idPrefix}font_size">`;
        for (let size of rb.getProperty('fontSizes')) {
            strFontSize += `<option value="${size}">${size}</option>`;
        }
        strFontSize += '</select>';
        let elFontSize = $(strFontSize)
            .change(event => {
                let val = elFontSize.val();
                let cmdGroup = new CommandGroupCmd('Set value', rb);
                let selectedObjects = rb.getSelectedObjects();
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), `${fieldPrefix}fontSize`, val, SetValueCmd.type.select, rb));

                    if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                        if (obj.getValue(`${fieldPrefix}fontSize`) !== val) {
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                        }
                    } else if (obj instanceof Style) {
                        obj.addCommandsForChangedProperty(
                            'fontSize', val, SetValueCmd.type.select, cmdGroup);
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    rb.executeCommand(cmdGroup);
                }
            });
        elFormField.append(elFontSize);
        elFormField.append(`<span>${rb.getLabel('styleFontSizeUnit')}</span>`);
        elFormField.append(`<div id="rbro_${idPrefix}font_error" class="rbroErrorMessage"></div>`);
        elDiv.append(elFormField);
        elPanel.append(elDiv);

        elDiv = $(`<div id="rbro_${idPrefix}line_spacing_row" class="rbroFormRow"></div>`);
        elDiv.append(`<label for="rbro_${idPrefix}line_spacing">
                      ${rb.getLabel('styleLineSpacing')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elLineSpacing = $(`<select id="rbro_${idPrefix}line_spacing">
                <option value="1">1</option>
                <option value="1.1">1.1</option>
                <option value="1.2">1.2</option>
                <option value="1.3">1.3</option>
                <option value="1.4">1.4</option>
                <option value="1.5">1.5</option>
                <option value="1.6">1.6</option>
                <option value="1.7">1.7</option>
                <option value="1.8">1.8</option>
                <option value="1.9">1.9</option>
                <option value="2">2</option>
            </select>`)
            .change(event => {
                let val = elLineSpacing.val();
                let cmdGroup = new CommandGroupCmd('Set value', rb);
                let selectedObjects = rb.getSelectedObjects();
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), `${fieldPrefix}lineSpacing`, val, SetValueCmd.type.select, rb));

                    if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                        if (obj.getValue(`${fieldPrefix}lineSpacing`) !== val) {
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                        }
                    } else if (obj instanceof Style) {
                        obj.addCommandsForChangedProperty(
                            'lineSpacing', val, SetValueCmd.type.select, cmdGroup);
                    }
                if (!cmdGroup.isEmpty()) {
                    rb.executeCommand(cmdGroup);
                }
                }
            });
        elFormField.append(elLineSpacing);
        elDiv.append(elFormField);
        elPanel.append(elDiv);

        let elBorderDiv = $(`<div id="rbro_${idPrefix}border_div"></div>`);
        elDiv = $(`<div id="rbro_${idPrefix}border_row" class="rbroFormRow"></div>`);
        elDiv.append(`<label>${rb.getLabel('styleBorder')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elBorderStyle = $(`<div id="rbro_${idPrefix}border"></div>`);
        let elBorderAll = $(
            `<button id="rbro_${idPrefix}border_all"
             class="rbroButton rbroActionButton rbroIcon-border-all"
             type="button" value="${fieldPrefix}borderAll" title="${rb.getLabel('styleBorderAll')}"></button>`)
            .click(event => {
                let val = !elBorderAll.hasClass('rbroButtonActive');
                let cmdGroup = new CommandGroupCmd('Set value', rb);
                let selectedObjects = rb.getSelectedObjects();
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
        let elBorderLeft = $(
            `<button id="rbro_${idPrefix}border_left"
             class="rbroButton rbroActionButton rbroIcon-border-left"
             type="button" value="${fieldPrefix}borderLeft" title="${rb.getLabel('orientationLeft')}"></button>`)
            .click(event => {
                let val = !elBorderLeft.hasClass('rbroButtonActive');
                let cmdGroup = new CommandGroupCmd('Set value', rb);
                let selectedObjects = rb.getSelectedObjects();
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), `${fieldPrefix}borderLeft`, val, SetValueCmd.type.button, rb));

                    if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                        if (obj.getValue(`${fieldPrefix}borderLeft`) !== val) {
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                        }
                    } else if (obj instanceof Style) {
                        obj.addCommandsForChangedProperty(
                            'borderLeft', val, SetValueCmd.type.button, cmdGroup);
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    rb.executeCommand(cmdGroup);
                }
            });
        elBorderStyle.append(elBorderLeft);
        let elBorderTop = $(
            `<button id="rbro_${idPrefix}border_top"
             class="rbroButton rbroActionButton rbroIcon-border-top"
             type="button" value="${fieldPrefix}borderTop" title="${rb.getLabel('orientationTop')}"></button>`)
            .click(event => {
                let val = !elBorderTop.hasClass('rbroButtonActive');
                let cmdGroup = new CommandGroupCmd('Set value', rb);
                let selectedObjects = rb.getSelectedObjects();
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), `${fieldPrefix}borderTop`, val, SetValueCmd.type.button, rb));

                    if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                        if (obj.getValue(`${fieldPrefix}borderTop`) !== val) {
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                        }
                    } else if (obj instanceof Style) {
                        obj.addCommandsForChangedProperty(
                            'borderTop', val, SetValueCmd.type.button, cmdGroup);
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    rb.executeCommand(cmdGroup);
                }
            });
        elBorderStyle.append(elBorderTop);
        let elBorderRight = $(
            `<button id="rbro_${idPrefix}border_right"
             class="rbroButton rbroActionButton rbroIcon-border-right"
             type="button" value="${fieldPrefix}borderRight" title="${rb.getLabel('orientationRight')}"></button>`)
            .click(event => {
                let val = !elBorderRight.hasClass('rbroButtonActive');
                let cmdGroup = new CommandGroupCmd('Set value', rb);
                let selectedObjects = rb.getSelectedObjects();
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), `${fieldPrefix}borderRight`, val, SetValueCmd.type.button, rb));

                    if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                        if (obj.getValue(`${fieldPrefix}borderRight`) !== val) {
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                        }
                    } else if (obj instanceof Style) {
                        obj.addCommandsForChangedProperty(
                            'borderRight', val, SetValueCmd.type.button, cmdGroup);
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    rb.executeCommand(cmdGroup);
                }
            });
        elBorderStyle.append(elBorderRight);
        let elBorderBottom = $(
            `<button id="rbro_${idPrefix}border_bottom"
             class="rbroButton rbroActionButton rbroIcon-border-bottom"
             type="button" value="${fieldPrefix}borderBottom"
             title="${rb.getLabel('orientationBottom')}"></button>`)
            .click(event => {
                let val = !elBorderBottom.hasClass('rbroButtonActive');
                let cmdGroup = new CommandGroupCmd('Set value', rb);
                let selectedObjects = rb.getSelectedObjects();
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), `${fieldPrefix}borderBottom`, val, SetValueCmd.type.button, rb));

                    if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                        if (obj.getValue(`${fieldPrefix}borderBottom`) !== val) {
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                        }
                    } else if (obj instanceof Style) {
                        obj.addCommandsForChangedProperty(
                            'borderBottom', val, SetValueCmd.type.button, cmdGroup);
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    rb.executeCommand(cmdGroup);
                }
            });
        elBorderStyle.append(elBorderBottom);
        elFormField.append(elBorderStyle);
        elDiv.append(elFormField);
        elBorderDiv.append(elDiv);

        if (renderDocElementMainStyle) {
            elDiv = $(`<div id="rbro_${idPrefix}table_border_row" class="rbroFormRow"></div>`);
            elDiv.append(`<label>${rb.getLabel('styleBorder')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elBorder = $(`<div id="rbro_${idPrefix}table_border"></div>`);
            let elBorderGrid = $(
                `<button id="rbro_${idPrefix}table_border_grid"
                 class="rbroButton rbroActionButton rbroIcon-border-table-grid"
                 type="button" value="${fieldPrefix}grid"
                 title="${rb.getLabel('docElementBorderGrid')}"></button>`)
                .click(event => {
                    let val = TableElement.border.grid;
                    let selectedObjects = rb.getSelectedObjects();
                    let valueChanged = false;
                    for (let i=selectedObjects.length - 1; i >= 0; i--) {
                        if (selectedObjects[i].getValue(`${fieldPrefix}border`) !== val) {
                            valueChanged = true;
                            break;
                        }
                    }

                    if (valueChanged) {
                        let cmdGroup = new CommandGroupCmd('Set value', rb);
                        for (let i = selectedObjects.length - 1; i >= 0; i--) {
                            let obj = selectedObjects[i];
                            cmdGroup.addSelection(obj.getId());
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), `${fieldPrefix}border`, val,
                                SetValueCmd.type.buttonGroup, rb));
                        }
                        if (!cmdGroup.isEmpty()) {
                            rb.executeCommand(cmdGroup);
                        }
                    }
                });
            elBorder.append(elBorderGrid);
            let elBorderFrameRow = $(
                `<button id="rbro_${idPrefix}table_border_frame_row"
                 class="rbroButton rbroActionButton rbroIcon-border-table-frame-row"
                 type="button" value="${fieldPrefix}frame_row"
                 title="${rb.getLabel('docElementBorderFrameRow')}"></button>`)
                .click(event => {
                    let val = TableElement.border.frameRow;
                    let selectedObjects = rb.getSelectedObjects();
                    let valueChanged = false;
                    for (let i=selectedObjects.length - 1; i >= 0; i--) {
                        if (selectedObjects[i].getValue(`${fieldPrefix}border`) !== val) {
                            valueChanged = true;
                            break;
                        }
                    }

                    if (valueChanged) {
                        let cmdGroup = new CommandGroupCmd('Set value', rb);
                        for (let i = selectedObjects.length - 1; i >= 0; i--) {
                            let obj = selectedObjects[i];
                            cmdGroup.addSelection(obj.getId());
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), `${fieldPrefix}border`, val,
                                SetValueCmd.type.buttonGroup, rb));
                        }
                        if (!cmdGroup.isEmpty()) {
                            rb.executeCommand(cmdGroup);
                        }
                    }
                });
            elBorder.append(elBorderFrameRow);
            let elBorderFrame = $(
                `<button id="rbro_${idPrefix}table_border_frame"
                 class="rbroButton rbroActionButton rbroIcon-border-table-frame"
                 type="button" value="${fieldPrefix}frame"
                 title="${rb.getLabel('docElementBorderFrame')}"></button>`)
                .click(event => {
                    let val = TableElement.border.frame;
                    let selectedObjects = rb.getSelectedObjects();
                    let valueChanged = false;
                    for (let i=selectedObjects.length - 1; i >= 0; i--) {
                        if (selectedObjects[i].getValue(`${fieldPrefix}border`) !== val) {
                            valueChanged = true;
                            break;
                        }
                    }

                    if (valueChanged) {
                        let cmdGroup = new CommandGroupCmd('Set value', rb);
                        for (let i = selectedObjects.length - 1; i >= 0; i--) {
                            let obj = selectedObjects[i];
                            cmdGroup.addSelection(obj.getId());
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), `${fieldPrefix}border`, val,
                                SetValueCmd.type.buttonGroup, rb));
                        }
                        if (!cmdGroup.isEmpty()) {
                            rb.executeCommand(cmdGroup);
                        }
                    }
                });
            elBorder.append(elBorderFrame);
            let elBorderRow = $(
                `<button id="rbro_${idPrefix}table_border_row"
                 class="rbroButton rbroActionButton rbroIcon-border-table-row"
                 type="button" value="${fieldPrefix}row"
                 title="${rb.getLabel('docElementBorderRow')}"></button>`)
                .click(event => {
                    let val = TableElement.border.row;
                    let selectedObjects = rb.getSelectedObjects();
                    let valueChanged = false;
                    for (let i=selectedObjects.length - 1; i >= 0; i--) {
                        if (selectedObjects[i].getValue(`${fieldPrefix}border`) !== val) {
                            valueChanged = true;
                            break;
                        }
                    }

                    if (valueChanged) {
                        let cmdGroup = new CommandGroupCmd('Set value', rb);
                        for (let i = selectedObjects.length - 1; i >= 0; i--) {
                            let obj = selectedObjects[i];
                            cmdGroup.addSelection(obj.getId());
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), `${fieldPrefix}border`, val,
                                SetValueCmd.type.buttonGroup, rb));
                        }
                        if (!cmdGroup.isEmpty()) {
                            rb.executeCommand(cmdGroup);
                        }
                    }
                });
            elBorder.append(elBorderRow);
            let elBorderNone = $(
                `<button id="rbro_${idPrefix}table_border_none"
                 class="rbroButton rbroActionButton rbroIcon-border-table-none"
                 type="button" value="${fieldPrefix}none"
                 title="${rb.getLabel('docElementBorderNone')}"></button>`)
                .click(event => {
                    let val = TableElement.border.none;
                    let selectedObjects = rb.getSelectedObjects();
                    let valueChanged = false;
                    for (let i=selectedObjects.length - 1; i >= 0; i--) {
                        if (selectedObjects[i].getValue(`${fieldPrefix}border`) !== val) {
                            valueChanged = true;
                            break;
                        }
                    }

                    if (valueChanged) {
                        let cmdGroup = new CommandGroupCmd('Set value', rb);
                        for (let i = selectedObjects.length - 1; i >= 0; i--) {
                            let obj = selectedObjects[i];
                            cmdGroup.addSelection(obj.getId());
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), `${fieldPrefix}border`, val,
                                SetValueCmd.type.buttonGroup, rb));
                        }
                        if (!cmdGroup.isEmpty()) {
                            rb.executeCommand(cmdGroup);
                        }
                    }
                });
            elBorder.append(elBorderNone);
            elFormField.append(elBorder);
            elDiv.append(elFormField);
            elBorderDiv.append(elDiv);
        }

        elDiv = $(`<div id="rbro_${idPrefix}border_color_row" class="rbroFormRow"></div>`);
        elDiv.append(`<label for="rbro_${idPrefix}border_color">
                      ${rb.getLabel('styleBorderColor')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elBorderColorContainer = $('<div class="rbroColorPickerContainer"></div>');
        let elBorderColor = $(`<input id="rbro_${idPrefix}border_color">`)
            .change(event => {
                let val = elBorderColor.val();
                if (utils.isValidColor(val)) {
                    let cmdGroup = new CommandGroupCmd('Set value', rb);
                    let selectedObjects = rb.getSelectedObjects();
                    for (let i=selectedObjects.length - 1; i >= 0; i--) {
                        let obj = selectedObjects[i];
                        cmdGroup.addSelection(obj.getId());
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), `${fieldPrefix}borderColor`, val,
                            SetValueCmd.type.color, rb));

                        if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                            if (obj.getValue(`${fieldPrefix}borderColor`) !== val) {
                                cmdGroup.addCommand(new SetValueCmd(
                                    obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                            }
                        } else if (obj instanceof Style) {
                            obj.addCommandsForChangedProperty(
                                'borderColor', val, SetValueCmd.type.color, cmdGroup);
                        }
                    }
                    if (!cmdGroup.isEmpty()) {
                        rb.executeCommand(cmdGroup);
                    }
                }
            });
        elBorderColorContainer.append(elBorderColor);
        controls[fieldPrefix + 'borderColor'] = utils.createColorPicker(
            elBorderColorContainer, elBorderColor, false, rb);
        elFormField.append(elBorderColorContainer);
        elDiv.append(elFormField);
        elBorderDiv.append(elDiv);

        elDiv = $(`<div id="rbro_${idPrefix}border_width_row" class="rbroFormRow"></div>`);
        elDiv.append(
            `<label for="rbro_${idPrefix}border_width">${rb.getLabel('styleBorderWidth')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elBorderWidth = $(`<input id="rbro_${idPrefix}border_width" type="number" step="0.5">`)
            .on('input', event => {
                let val = elBorderWidth.val();
                if (val !== '') {
                    val = utils.checkInputDecimal(val, 0.5, 99);
                }
                if (val !== elBorderWidth.val()) {
                    elBorderWidth.val(val);
                }
                let selectedObjects = rb.getSelectedObjects();
                let valueChanged = false;
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    if (selectedObjects[i].getValue(`${fieldPrefix}borderWidth`) !== val) {
                        valueChanged = true;
                        break;
                    }
                }

                if (valueChanged) {
                    let cmdGroup = new CommandGroupCmd('Set value', rb);
                    for (let i=selectedObjects.length - 1; i >= 0; i--) {
                        let obj = selectedObjects[i];
                        cmdGroup.addSelection(obj.getId());
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), `${fieldPrefix}borderWidth`, val,
                            SetValueCmd.type.text, rb));

                        if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                            if (obj.getValue(`${fieldPrefix}borderWidth`) !== val) {
                                cmdGroup.addCommand(new SetValueCmd(
                                    obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                            }
                        } else if (obj instanceof Style) {
                            obj.addCommandsForChangedProperty(
                                'borderWidth', val, SetValueCmd.type.text, cmdGroup);
                        }
                    }
                    if (!cmdGroup.isEmpty()) {
                        rb.executeCommand(cmdGroup);
                    }
                }
            });
        elFormField.append(elBorderWidth);
        elDiv.append(elFormField);
        elBorderDiv.append(elDiv);
        elPanel.append(elBorderDiv);


        elDiv = $(`<div id="rbro_${idPrefix}padding_row" class="rbroFormRow"></div>`);
        elDiv.append(`<label for="rbro_${idPrefix}padding">${rb.getLabel('stylePadding')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSmallInput"></div>');

        let elPaddingTopDiv = $('<div class="rbroColumnCenter"></div>');
        let elPaddingTop = $(
            `<input id="rbro_${idPrefix}padding_top"
             placeholder="${rb.getLabel('orientationTop')}" type="number">`)
            .on('input', event => {
                let val = elPaddingTop.val();
                let cmdGroup = new CommandGroupCmd('Set value', rb);
                let selectedObjects = rb.getSelectedObjects();
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), `${fieldPrefix}paddingTop`, val, SetValueCmd.type.text, rb));

                    if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                        if (obj.getValue(`${fieldPrefix}paddingTop`) !== val) {
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                        }
                    } else if (obj instanceof Style) {
                        obj.addCommandsForChangedProperty(
                            'paddingTop', val, SetValueCmd.type.text, cmdGroup);
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    rb.executeCommand(cmdGroup);
                }
            });
        elPaddingTopDiv.append(elPaddingTop);
        elFormField.append(elPaddingTopDiv);

        let elDiv2 = $('<div class="rbroSplit"></div>');
        let elPaddingLeft = $(
            `<input id="rbro_${idPrefix}padding_left"
             placeholder="${rb.getLabel('orientationLeft')}" type="number">`)
            .on('input', event => {
                let val = elPaddingLeft.val();
                let cmdGroup = new CommandGroupCmd('Set value', rb);
                let selectedObjects = rb.getSelectedObjects();
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), `${fieldPrefix}paddingLeft`, val, SetValueCmd.type.text, rb));

                    if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                        if (obj.getValue(`${fieldPrefix}paddingLeft`) !== val) {
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                        }
                    } else if (obj instanceof Style) {
                        obj.addCommandsForChangedProperty(
                            'paddingLeft', val, SetValueCmd.type.text, cmdGroup);
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    rb.executeCommand(cmdGroup);
                }
            });
        elDiv2.append(elPaddingLeft);
        let elPaddingRight = $(
            `<input id="rbro_${idPrefix}padding_right"
             placeholder="${rb.getLabel('orientationRight')}" type="number">`)
            .on('input', event => {
                let val = elPaddingRight.val();
                let cmdGroup = new CommandGroupCmd('Set value', rb);
                let selectedObjects = rb.getSelectedObjects();
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), `${fieldPrefix}paddingRight`, val, SetValueCmd.type.text, rb));

                    if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                        if (obj.getValue(`${fieldPrefix}paddingRight`) !== val) {
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                        }
                    } else if (obj instanceof Style) {
                        obj.addCommandsForChangedProperty(
                            'paddingRight', val, SetValueCmd.type.text, cmdGroup);
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    rb.executeCommand(cmdGroup);
                }
            });
        elDiv2.append(elPaddingRight);
        elFormField.append(elDiv2);

        let elPaddingBottomDiv = $('<div class="rbroColumnCenter"></div>');
        let elPaddingBottom = $(
            `<input id="rbro_${idPrefix}padding_bottom"
             placeholder="${rb.getLabel('orientationBottom')}" type="number">`)
            .on('input', event => {
                let val = elPaddingBottom.val();
                let cmdGroup = new CommandGroupCmd('Set value', rb);
                let selectedObjects = rb.getSelectedObjects();
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), `${fieldPrefix}paddingBottom`, val, SetValueCmd.type.text, rb));

                    if (obj instanceof DocElement && obj.getValue(`${fieldPrefix}styleId`) !== '') {
                        if (obj.getValue(`${fieldPrefix}paddingBottom`) !== val) {
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), `${fieldPrefix}styleId`, '', SetValueCmd.type.select, rb));
                        }
                    } else if (obj instanceof Style) {
                        obj.addCommandsForChangedProperty(
                            'paddingBottom', val, SetValueCmd.type.text, cmdGroup);
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    rb.executeCommand(cmdGroup);
                }
            });
        elPaddingBottomDiv.append(elPaddingBottom);
        elFormField.append(elPaddingBottomDiv);
        elDiv.append(elFormField);
        elPanel.append(elDiv);
    }

    destroy() {
        StylePanel.destroyStyle('', this.controls);
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

    /**
     * Is called when the selection is changed or the selected element was changed.
     * The panel is updated to show the values of the selected data object.
     * @param {String} [field] - affected field in case of change operation.
     */
    updateDisplay(field) {
        let selectedObject = this.rb.getSelectedObject();

        if (selectedObject !== null && selectedObject instanceof Style) {
            for (let property in this.propertyDescriptors) {
                if (this.propertyDescriptors.hasOwnProperty(property) && (field === null || property === field)) {
                    let propertyDescriptor = this.propertyDescriptors[property];
                    let value = selectedObject.getValue(property);
                    super.setValue(propertyDescriptor, value, false);
                }
            }
        }
    }
}
