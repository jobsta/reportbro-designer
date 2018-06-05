import SetValueCmd from '../commands/SetValueCmd';
import Style from '../data/Style';
import DocElement from '../elements/DocElement';
import * as utils from '../utils';

/**
 * Panel to edit all style properties.
 * @class
 */
export default class StylePanel {
    constructor(rootElement, rb) {
        this.rootElement = rootElement;
        this.rb = rb;
        this.selectedObjId = null;
    }

    render(data) {
        let panel = $('<div id="rbro_style_panel" class="rbroHidden"></div>');
        let elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_style_name">${this.rb.getLabel('styleName')}:</label>`);
        let elFormField = $('<div class="rbroFormField"></div>');
        let elStyleName = $(`<input id="rbro_style_name">`)
            .change(event => {
                if (this.rb.getDataObject(this.selectedObjId) !== null) {
                    if (elStyleName.val().trim() !== '') {
                        let cmd = new SetValueCmd(this.selectedObjId, 'rbro_style_name', 'name',
                            elStyleName.val(), SetValueCmd.type.text, this.rb);
                        this.rb.executeCommand(cmd);
                    } else {
                        elStyleName.val(style.getName());
                    }
                }
            });
        elFormField.append(elStyleName);
        elDiv.append(elFormField);
        panel.append(elDiv);

        StylePanel.renderStyle(panel, 'style_', '', DocElement.type.none, this, this.rb);

        $('#rbro_detail_panel').append(panel);
    }

    static renderPaddingControls(elPanel, idPrefix, fieldPrefix, panel, rb) {
        let elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_${idPrefix}padding">${rb.getLabel('stylePadding')}:</label>`);
        let elFormField = $('<div class="rbroFormField rbroSmallInput"></div>');
        
        let elPaddingTopDiv = $('<div class="rbroColumnCenter"></div>');
        let elPaddingTop = $(`<input id="rbro_${idPrefix}padding_top" placeholder="${rb.getLabel('orientationTop')}">`)
            .on('input', event => {
                if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                    let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}padding_top`,
                        `${fieldPrefix}paddingTop`, elPaddingTop.val(), SetValueCmd.type.text, rb);
                    rb.executeCommand(cmd);
                }
            });
        utils.setInputPositiveInteger(elPaddingTop);
        elPaddingTopDiv.append(elPaddingTop);
        elFormField.append(elPaddingTopDiv);

        let elDiv2 = $('<div class="rbroSplit"></div>');
        let elPaddingLeft = $(`<input id="rbro_${idPrefix}padding_left" placeholder="${rb.getLabel('orientationLeft')}">`)
            .on('input', event => {
                if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                    let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}padding_left`,
                        `${fieldPrefix}paddingLeft`, elPaddingLeft.val(), SetValueCmd.type.text, rb);
                    rb.executeCommand(cmd);
                }
            });
        utils.setInputPositiveInteger(elPaddingLeft);
        elDiv2.append(elPaddingLeft);
        let elPaddingRight = $(`<input id="rbro_${idPrefix}padding_right" placeholder="${rb.getLabel('orientationRight')}">`)
            .on('input', event => {
                if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                    let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}padding_right`,
                        `${fieldPrefix}paddingRight`, elPaddingRight.val(), SetValueCmd.type.text, rb);
                    rb.executeCommand(cmd);
                }
            });
        utils.setInputPositiveInteger(elPaddingRight);
        elDiv2.append(elPaddingRight);
        elFormField.append(elDiv2);

        let elPaddingBottomDiv = $('<div class="rbroColumnCenter"></div>');
        let elPaddingBottom = $(`<input id="rbro_${idPrefix}padding_bottom" placeholder="${rb.getLabel('orientationBottom')}">`)
            .on('input', event => {
                if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                    let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}padding_bottom`,
                        `${fieldPrefix}paddingBottom`, elPaddingBottom.val(), SetValueCmd.type.text, rb);
                    rb.executeCommand(cmd);
                }
            });
        utils.setInputPositiveInteger(elPaddingBottom);
        elPaddingBottomDiv.append(elPaddingBottom);
        elFormField.append(elPaddingBottomDiv);
        elDiv.append(elFormField);
        elPanel.append(elDiv);
    }

    static renderStyle(elPanel, idPrefix, fieldPrefix, elementType, panel, rb) {
        let elDiv, elFormField;
        if (elementType === DocElement.type.none || elementType === DocElement.type.text) {
            elDiv = $('<div class="rbroFormRow"></div>');
            elDiv.append(`<label>${rb.getLabel('styleTextStyle')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elTextStyle = $(`<div id="rbro_${idPrefix}textstyle"></div>`);
            let elBold = $(`<button id="rbro_${idPrefix}bold" name="style_bold" class="rbroButton rbroActionButton rbroIcon-bold" type="button"
                    title="${rb.getLabel('styleBold')}"></button>`)
                .click(event => {
                    if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                        let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}bold`,
                            `${fieldPrefix}bold`, !elBold.hasClass('rbroButtonActive'), SetValueCmd.type.button, rb);
                        rb.executeCommand(cmd);
                    }
                });
            elTextStyle.append(elBold);
            let elItalic = $(`<button id="rbro_${idPrefix}italic"
                    class="rbroButton rbroActionButton rbroIcon-italic" type="button"
                    title="${rb.getLabel('styleItalic')}"></button>`)
                .click(event => {
                    if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                        let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}italic`,
                            `${fieldPrefix}italic`, !elItalic.hasClass('rbroButtonActive'), SetValueCmd.type.button, rb);
                        rb.executeCommand(cmd);
                    }
                });
            elTextStyle.append(elItalic);
            let elunderline = $(`<button id="rbro_${idPrefix}underline"
                    class="rbroButton rbroActionButton rbroIcon-underline" type="button"
                    title="${rb.getLabel('styleunderline')}"></button>`)
                .click(event => {
                    if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                        let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}underline`,
                            `${fieldPrefix}underline`, !elunderline.hasClass('rbroButtonActive'), SetValueCmd.type.button, rb);
                        rb.executeCommand(cmd);
                    }
                });
            elTextStyle.append(elunderline);
            elFormField.append(elTextStyle);
            elDiv.append(elFormField);
            elPanel.append(elDiv);
        }

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label>${rb.getLabel('styleAlignment')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elHAlignment = $(`<div id="rbro_${idPrefix}halignment"></div>`);
        let elHAlignmentLeft = $(`<button id="rbro_${idPrefix}halignment_left"
                class="rbroButton rbroActionButton rbroIcon-text-align-left" type="button" value="left"
                title="${rb.getLabel('styleHAlignmentLeft')}"></button>`)
            .click(event => {
                if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                    let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}halignment`,
                        `${fieldPrefix}horizontalAlignment`, Style.alignment.left, SetValueCmd.type.buttonGroup, rb);
                    rb.executeCommand(cmd);
                }
            });
        elHAlignment.append(elHAlignmentLeft);
        let elHAlignmentCenter = $(`<button id="rbro_${idPrefix}halignment_center"
                class="rbroButton rbroActionButton rbroIcon-text-align-center" type="button" value="center"
                title="${rb.getLabel('styleHAlignmentCenter')}"></button>`)
            .click(event => {
                if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                    let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}halignment`,
                        `${fieldPrefix}horizontalAlignment`, Style.alignment.center, SetValueCmd.type.buttonGroup, rb);
                    rb.executeCommand(cmd);
                }
            });
        elHAlignment.append(elHAlignmentCenter);
        let elHAlignmentRight = $(`<button id="rbro_${idPrefix}halignment_right"
                class="rbroButton rbroActionButton rbroIcon-text-align-right" type="button" value="right"
                title="${rb.getLabel('styleHAlignmentRight')}"></button>`)
            .click(event => {
                if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                    let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}halignment`,
                        `${fieldPrefix}horizontalAlignment`, Style.alignment.right, SetValueCmd.type.buttonGroup, rb);
                    rb.executeCommand(cmd);
                }
            });
        elHAlignment.append(elHAlignmentRight);
        if (elementType === DocElement.type.none || elementType === DocElement.type.text) {
            let elHAlignmentJustify = $(`<button id="rbro_${idPrefix}halignment_justify"
                    class="rbroButton rbroActionButton rbroIcon-text-align-justify" type="button" value="justify"
                    title="${rb.getLabel('styleHAlignmentJustify')}"></button>`)
                .click(event => {
                    if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                        let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}halignment`,
                            `${fieldPrefix}horizontalAlignment`, Style.alignment.justify, SetValueCmd.type.buttonGroup, rb);
                        rb.executeCommand(cmd);
                    }
                });
            elHAlignment.append(elHAlignmentJustify);
        }
        elFormField.append(elHAlignment);

        let elVAlignment = $(`<div id="rbro_${idPrefix}valignment"></div>`);
        let elVAlignmentTop = $(`<button id="rbro_${idPrefix}valignment_top"
                class="rbroButton rbroActionButton rbroIcon-align-top" type="button" value="top"
                title="${rb.getLabel('styleVAlignmentTop')}"></button>`)
            .click(event => {
                if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                    let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}valignment`,
                        `${fieldPrefix}verticalAlignment`, Style.alignment.top, SetValueCmd.type.buttonGroup, rb);
                    rb.executeCommand(cmd);
                }
            });
        elVAlignment.append(elVAlignmentTop);
        let elVAlignmentMiddle = $(`<button id="rbro_${idPrefix}valignment_middle"
                class="rbroButton rbroActionButton rbroIcon-align-middle" type="button" value="middle"
                title="${rb.getLabel('styleVAlignmentMiddle')}"></button>`)
            .click(event => {
                if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                    let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}valignment`,
                        `${fieldPrefix}verticalAlignment`, Style.alignment.middle, SetValueCmd.type.buttonGroup, rb);
                    rb.executeCommand(cmd);
                }
            });
        elVAlignment.append(elVAlignmentMiddle);
        let elVAlignmentBottom = $(`<button id="rbro_${idPrefix}valignment_bottom"
                class="rbroButton rbroActionButton rbroIcon-align-bottom" type="button" value="bottom"
                title="${rb.getLabel('styleVAlignmentBottom')}"></button>`)
            .click(event => {
                if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                    let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}valignment`,
                        `${fieldPrefix}verticalAlignment`, Style.alignment.bottom, SetValueCmd.type.buttonGroup, rb);
                    rb.executeCommand(cmd);
                }
            });
        elVAlignment.append(elVAlignmentBottom);
        elFormField.append(elVAlignment);
        elDiv.append(elFormField);
        elPanel.append(elDiv);

        if (elementType === DocElement.type.none || elementType === DocElement.type.text) {
            elDiv = $('<div class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_${idPrefix}text_color">${rb.getLabel('styleTextColor')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elTextColorContainer = $('<div class="rbroColorPickerContainer"></div>');
            let elTextColor = $(`<input id="rbro_${idPrefix}text_color">`)
                .change(event => {
                    if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                        let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}text_color`,
                            `${fieldPrefix}textColor`, elTextColor.val(), SetValueCmd.type.color, rb);
                        rb.executeCommand(cmd);
                    }
                });
            elTextColorContainer.append(elTextColor);
            elFormField.append(elTextColorContainer);
            elDiv.append(elFormField);
            elPanel.append(elDiv);
            utils.initColorPicker(elTextColor, rb);
        }

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_${idPrefix}background_color">${rb.getLabel('styleBackgroundColor')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elBgColorContainer = $('<div class="rbroColorPickerContainer"></div>');
        let elBgColor = $(`<input id="rbro_${idPrefix}background_color">`)
            .change(event => {
                if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                    let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}background_color`,
                        `${fieldPrefix}backgroundColor`, elBgColor.val(), SetValueCmd.type.color, rb);
                    rb.executeCommand(cmd);
                }
            });
        elBgColorContainer.append(elBgColor);
        elFormField.append(elBgColorContainer);
        elDiv.append(elFormField);
        elPanel.append(elDiv);
        utils.initColorPicker(elBgColor, rb, { allowEmpty: true });

        if (elementType === DocElement.type.none || elementType === DocElement.type.text) {
            elDiv = $('<div class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_${idPrefix}font">${rb.getLabel('styleFont')}:</label>`);
            elFormField = $('<div class="rbroFormField rbroSplit rbroSelectFont"></div>');
            let strFont = `<select id="rbro_${idPrefix}font">`;
            for (let font of rb.getFonts()) {
                strFont += `<option value="${font.value}">${font.name}</option>`;
            }
            strFont += '</select>';
            let elFont = $(strFont)
                .change(event => {
                    if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                        let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}font`,
                            `${fieldPrefix}font`, elFont.val(), SetValueCmd.type.select, rb);
                        rb.executeCommand(cmd);
                    }
                });
            elFormField.append(elFont);
            let strFontSize = `<select id="rbro_${idPrefix}font_size">`;
            for (let size of [8,9,10,11,12,13,14,15,16,18,20,22,24,26,28,32,36,40,44,48,54,60,66,72,80]) {
                strFontSize += `<option value="${size}">${size}</option>`;
            }
            strFontSize += '</select>';
            let elFontSize = $(strFontSize)
                .change(event => {
                    if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                        let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}font_size`,
                            `${fieldPrefix}fontSize`, elFontSize.val(), SetValueCmd.type.select, rb);
                        rb.executeCommand(cmd);
                    }
                });
            elFormField.append(elFontSize);
            elFormField.append(`<span>${rb.getLabel('styleFontSizeUnit')}</span>`);
            elDiv.append(elFormField);
            elPanel.append(elDiv);

            elDiv = $('<div class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_${idPrefix}line_spacing">${rb.getLabel('styleLineSpacing')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elLineSpacing = $(`<select id="rbro_${idPrefix}line_spacing">
                    <option value="1">1</option>
                    <option value="1.5">1.5</option>
                    <option value="2">2</option>
                </select>`)
                .change(event => {
                    if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                        let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}line_spacing`,
                            `${fieldPrefix}lineSpacing`, elLineSpacing.val(), SetValueCmd.type.select, rb);
                        rb.executeCommand(cmd);
                    }
                });
            elFormField.append(elLineSpacing);
            elDiv.append(elFormField);
            elPanel.append(elDiv);

            let elBorderDiv = $(`<div id="rbro_${idPrefix}border_div"></div>`);
            elDiv = $('<div class="rbroFormRow"></div>');
            elDiv.append(`<label>${rb.getLabel('styleBorder')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elBorderStyle = $(`<div id="rbro_${idPrefix}border"></div>`);
            let elBorderAll = $(`<button id="rbro_${idPrefix}border_all" class="rbroButton rbroActionButton rbroIcon-border-all"
                    type="button" value="${fieldPrefix}borderAll"
                    title="${rb.getLabel('styleBorderAll')}"></button>`)
                .click(event => {
                    if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                        let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}border_all`,
                            `${fieldPrefix}borderAll`, !elBorderAll.hasClass('rbroButtonActive'),
                            SetValueCmd.type.button, rb);
                        rb.executeCommand(cmd);
                    }
                });
            elBorderStyle.append(elBorderAll);
            let elBorderLeft = $(`<button id="rbro_${idPrefix}border_left" class="rbroButton rbroActionButton rbroIcon-border-left"
                    type="button" value="${fieldPrefix}borderLeft"
                    title="${rb.getLabel('orientationLeft')}"></button>`)
                .click(event => {
                    if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                        let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}border_left`,
                            `${fieldPrefix}borderLeft`, !elBorderLeft.hasClass('rbroButtonActive'),
                            SetValueCmd.type.button, rb);
                        rb.executeCommand(cmd);
                    }
                });
            elBorderStyle.append(elBorderLeft);
            let elBorderTop = $(`<button id="rbro_${idPrefix}border_top" class="rbroButton rbroActionButton rbroIcon-border-top"
                    type="button" value="${fieldPrefix}borderTop"
                    title="${rb.getLabel('orientationTop')}"></button>`)
                .click(event => {
                    if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                        let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}border_top`,
                            `${fieldPrefix}borderTop`, !elBorderTop.hasClass('rbroButtonActive'),
                            SetValueCmd.type.button, rb);
                        rb.executeCommand(cmd);
                    }
                });
            elBorderStyle.append(elBorderTop);
            let elBorderRight = $(`<button id="rbro_${idPrefix}border_right" class="rbroButton rbroActionButton rbroIcon-border-right"
                    type="button" value="${fieldPrefix}borderRight"
                    title="${rb.getLabel('orientationRight')}"></button>`)
                .click(event => {
                    if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                        let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}border_right`,
                            `${fieldPrefix}borderRight`, !elBorderRight.hasClass('rbroButtonActive'),
                            SetValueCmd.type.button, rb);
                        rb.executeCommand(cmd);
                    }
                });
            elBorderStyle.append(elBorderRight);
            let elBorderBottom = $(`<button id="rbro_${idPrefix}border_bottom" class="rbroButton rbroActionButton rbroIcon-border-bottom"
                    type="button" value="${fieldPrefix}borderBottom"
                    title="${rb.getLabel('orientationBottom')}"></button>`)
                .click(event => {
                    if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                        let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}border_bottom`,
                            `${fieldPrefix}borderBottom`, !elBorderBottom.hasClass('rbroButtonActive'),
                            SetValueCmd.type.button, rb);
                        rb.executeCommand(cmd);
                    }
                });
            elBorderStyle.append(elBorderBottom);
            elFormField.append(elBorderStyle);
            elDiv.append(elFormField);
            elBorderDiv.append(elDiv);

            elDiv = $('<div class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_${idPrefix}border_color">${rb.getLabel('styleBorderColor')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elBorderColorContainer = $('<div class="rbroColorPickerContainer"></div>');
            let elBorderColor = $(`<input id="rbro_${idPrefix}border_color">`)
                .change(event => {
                    if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                        let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}border_color`,
                            `${fieldPrefix}borderColor`, elBorderColor.val(), SetValueCmd.type.color, rb);
                        rb.executeCommand(cmd);
                    }
                });
            elBorderColorContainer.append(elBorderColor);
            elFormField.append(elBorderColorContainer);
            elDiv.append(elFormField);
            elBorderDiv.append(elDiv);
            utils.initColorPicker(elBorderColor, rb);

            elDiv = $('<div class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_${idPrefix}border_width">${rb.getLabel('styleBorderWidth')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elBorderWidth = $(`<input id="rbro_${idPrefix}border_width">`)
                .on('input', event => {
                    if (rb.getDataObject(panel.getSelectedObjId()) !== null) {
                        let cmd = new SetValueCmd(panel.getSelectedObjId(), `rbro_${idPrefix}border_width`,
                            `${fieldPrefix}borderWidth`, elBorderWidth.val(), SetValueCmd.type.text, rb);
                        rb.executeCommand(cmd);
                    }
                });
            elFormField.append(elBorderWidth);
            elDiv.append(elFormField);
            elBorderDiv.append(elDiv);
            utils.setInputDecimal(elBorderWidth);
            elPanel.append(elBorderDiv);

            StylePanel.renderPaddingControls(elPanel, idPrefix, fieldPrefix, panel, rb);
        }
    }

    show(data) {
        $('#rbro_style_panel').removeClass('rbroHidden');
        this.updateData(data);
    }

    hide() {
        $('#rbro_style_panel').addClass('rbroHidden');
    }

    /**
     * Is called when the selected element was changed.
     * The panel is updated to show the values of the selected data object.
     * @param {Style} data
     */
    updateData(data) {
        if (data !== null) {
            $('#rbro_style_name').prop('disabled', false);
            this.selectedObjId = data.getId();
        } else {
            $('#rbro_style_name').prop('disabled', true);
        }
        StylePanel.updateStyleData(data, 'style_', '', DocElement.type.none);
        this.updateErrors();
    }

    static updateStyleData(data, idPrefix, fieldPrefix, elementType) {
        if (data !== null) {
            $(`#rbro_${idPrefix}halignment_left`).prop('disabled', false);
            $(`#rbro_${idPrefix}halignment_center`).prop('disabled', false);
            $(`#rbro_${idPrefix}halignment_right`).prop('disabled', false);
            $(`#rbro_${idPrefix}valignment_top`).prop('disabled', false);
            $(`#rbro_${idPrefix}valignment_middle`).prop('disabled', false);
            $(`#rbro_${idPrefix}valignment_bottom`).prop('disabled', false);
            $(`#rbro_${idPrefix}background_color`).spectrum('enable');
            $(`#rbro_${idPrefix}border_all`).prop('disabled', false);
            $(`#rbro_${idPrefix}border_left`).prop('disabled', false);
            $(`#rbro_${idPrefix}border_top`).prop('disabled', false);
            $(`#rbro_${idPrefix}border_right`).prop('disabled', false);
            $(`#rbro_${idPrefix}border_bottom`).prop('disabled', false);
            $(`#rbro_${idPrefix}border_color`).spectrum('enable');
            $(`#rbro_${idPrefix}border_width`).prop('disabled', false);
            if (elementType === DocElement.type.none) {
                $(`#rbro_${idPrefix}name`).prop('disabled', false);
            }
            if (elementType === DocElement.type.none || elementType === DocElement.type.text) {
                $(`#rbro_${idPrefix}bold`).prop('disabled', false);
                $(`#rbro_${idPrefix}italic`).prop('disabled', false);
                $(`#rbro_${idPrefix}underline`).prop('disabled', false);
                $(`#rbro_${idPrefix}halignment_justify`).prop('disabled', false);
                $(`#rbro_${idPrefix}text_color`).spectrum('enable');
                $(`#rbro_${idPrefix}font`).prop('disabled', false);
                $(`#rbro_${idPrefix}font_size`).prop('disabled', false);
                $(`#rbro_${idPrefix}line_spacing`).prop('disabled', false);
                $(`#rbro_${idPrefix}padding_top`).prop('disabled', false);
                $(`#rbro_${idPrefix}padding_left`).prop('disabled', false);
                $(`#rbro_${idPrefix}padding_right`).prop('disabled', false);
                $(`#rbro_${idPrefix}padding_bottom`).prop('disabled', false);
            }

            $(`#rbro_${idPrefix}halignment_left`).parent().find('button').removeClass('rbroButtonActive');
            let horizontalAlignment = data.getValue(`${fieldPrefix}horizontalAlignment`);
            if (horizontalAlignment === Style.alignment.left) {
                $(`#rbro_${idPrefix}halignment_left`).addClass('rbroButtonActive');
            }
            else if (horizontalAlignment === Style.alignment.center) {
                $(`#rbro_${idPrefix}halignment_center`).addClass('rbroButtonActive');
            }
            else if (horizontalAlignment === Style.alignment.right) {
                $(`#rbro_${idPrefix}halignment_right`).addClass('rbroButtonActive');
            }
            else if (horizontalAlignment === Style.alignment.justify) {
                $(`#rbro_${idPrefix}halignment_justify`).addClass('rbroButtonActive');
            }
            $(`#rbro_${idPrefix}valignment_top`).parent().find('button').removeClass('rbroButtonActive');
            let verticalAlignment = data.getValue(`${fieldPrefix}verticalAlignment`);
            if (verticalAlignment == Style.alignment.top) {
                $(`#rbro_${idPrefix}valignment_top`).addClass('rbroButtonActive');
            }
            else if (verticalAlignment === Style.alignment.middle) {
                $(`#rbro_${idPrefix}valignment_middle`).addClass('rbroButtonActive');
            }
            else if (verticalAlignment === Style.alignment.bottom) {
                $(`#rbro_${idPrefix}valignment_bottom`).addClass('rbroButtonActive');
            }

            if (elementType === DocElement.type.none || elementType === DocElement.type.text || elementType === DocElement.type.image) {
                $(`#rbro_${idPrefix}background_color`).spectrum("set", data.getValue(`${fieldPrefix}backgroundColor`));
                if (data.getValue(`${fieldPrefix}borderAll`)) {
                    $(`#rbro_${idPrefix}border_all`).addClass('rbroButtonActive');
                } else {
                    $(`#rbro_${idPrefix}border_all`).removeClass('rbroButtonActive');
                }
                if (data.getValue(`${fieldPrefix}borderLeft`)) {
                    $(`#rbro_${idPrefix}border_left`).addClass('rbroButtonActive');
                } else {
                    $(`#rbro_${idPrefix}border_left`).removeClass('rbroButtonActive');
                }
                if (data.getValue(`${fieldPrefix}borderTop`)) {
                    $(`#rbro_${idPrefix}border_top`).addClass('rbroButtonActive');
                } else {
                    $(`#rbro_${idPrefix}border_top`).removeClass('rbroButtonActive');
                }
                if (data.getValue(`${fieldPrefix}borderRight`)) {
                    $(`#rbro_${idPrefix}border_right`).addClass('rbroButtonActive');
                } else {
                    $(`#rbro_${idPrefix}border_right`).removeClass('rbroButtonActive');
                }
                if (data.getValue(`${fieldPrefix}borderBottom`)) {
                    $(`#rbro_${idPrefix}border_bottom`).addClass('rbroButtonActive');
                } else {
                    $(`#rbro_${idPrefix}border_bottom`).removeClass('rbroButtonActive');
                }
                $(`#rbro_${idPrefix}border_color`).spectrum("set", data.getValue(`${fieldPrefix}borderColor`));
                $(`#rbro_${idPrefix}border_width`).val(data.getValue(`${fieldPrefix}borderWidth`));
            }

            if (elementType === DocElement.type.none) {
                $(`#rbro_${idPrefix}name`).val(data.getName());
            }
            if (elementType === DocElement.type.none || elementType === DocElement.type.text) {
                if (data.getValue(`${fieldPrefix}bold`)) {
                    $(`#rbro_${idPrefix}bold`).addClass('rbroButtonActive');
                } else {
                    $(`#rbro_${idPrefix}bold`).removeClass('rbroButtonActive');
                }
                if (data.getValue(`${fieldPrefix}italic`)) {
                    $(`#rbro_${idPrefix}italic`).addClass('rbroButtonActive');
                } else {
                    $(`#rbro_${idPrefix}italic`).removeClass('rbroButtonActive');
                }
                if (data.getValue(`${fieldPrefix}underline`)) {
                    $(`#rbro_${idPrefix}underline`).addClass('rbroButtonActive');
                } else {
                    $(`#rbro_${idPrefix}underline`).removeClass('rbroButtonActive');
                }
                $(`#rbro_${idPrefix}text_color`).spectrum("set", data.getValue(`${fieldPrefix}textColor`));
                $(`#rbro_${idPrefix}font`).val(data.getValue(`${fieldPrefix}font`));
                $(`#rbro_${idPrefix}font_size`).val(data.getValue(`${fieldPrefix}fontSize`));
                $(`#rbro_${idPrefix}line_spacing`).val(data.getValue(`${fieldPrefix}lineSpacing`));
                $(`#rbro_${idPrefix}padding_top`).val(data.getValue(`${fieldPrefix}paddingTop`));
                $(`#rbro_${idPrefix}padding_left`).val(data.getValue(`${fieldPrefix}paddingLeft`));
                $(`#rbro_${idPrefix}padding_right`).val(data.getValue(`${fieldPrefix}paddingRight`));
                $(`#rbro_${idPrefix}padding_bottom`).val(data.getValue(`${fieldPrefix}paddingBottom`));
            }
        } else {
            $(`#rbro_${idPrefix}halignment_left`).prop('disabled', true);
            $(`#rbro_${idPrefix}halignment_center`).prop('disabled', true);
            $(`#rbro_${idPrefix}halignment_right`).prop('disabled', true);
            $(`#rbro_${idPrefix}valignment_top`).prop('disabled', true);
            $(`#rbro_${idPrefix}valignment_middle`).prop('disabled', true);
            $(`#rbro_${idPrefix}valignment_bottom`).prop('disabled', true);
            $(`#rbro_${idPrefix}background_color`).spectrum('disable');
            if (elementType === DocElement.type.none || elementType === DocElement.type.text || elementType === DocElement.type.image) {
                $(`#rbro_${idPrefix}border_left`).prop('disabled', true);
                $(`#rbro_${idPrefix}border_top`).prop('disabled', true);
                $(`#rbro_${idPrefix}border_right`).prop('disabled', true);
                $(`#rbro_${idPrefix}border_bottom`).prop('disabled', true);
                $(`#rbro_${idPrefix}border_color`).spectrum('disable');
                $(`#rbro_${idPrefix}border_width`).prop('disabled', true);
            }

            if (elementType === DocElement.type.none) {
                $(`#rbro_${idPrefix}name`).prop('disabled', true);
            }
            if (elementType === DocElement.type.none || elementType === DocElement.type.text) {
                $(`#rbro_${idPrefix}bold`).prop('disabled', true);
                $(`#rbro_${idPrefix}italic`).prop('disabled', true);
                $(`#rbro_${idPrefix}underline`).prop('disabled', true);
                $(`#rbro_${idPrefix}halignment_justify`).prop('disabled', true);
                $(`#rbro_${idPrefix}text_color`).spectrum('disable');
                $(`#rbro_${idPrefix}font`).prop('disabled', true);
                $(`#rbro_${idPrefix}font_size`).prop('disabled', true);
                $(`#rbro_${idPrefix}line_spacing`).prop('disabled', true);
                $(`#rbro_${idPrefix}padding_top`).prop('disabled', true);
                $(`#rbro_${idPrefix}padding_left`).prop('disabled', true);
                $(`#rbro_${idPrefix}padding_right`).prop('disabled', true);
                $(`#rbro_${idPrefix}padding_bottom`).prop('disabled', true);
            }
        }
    }

    /**
     * Is called when a data object was modified (including new and deleted data objects).
     * @param {*} obj - new/deleted/modified data object.
     * @param {String} operation - operation which caused the notification.
     */
    notifyEvent(obj, operation) {
    }

    /**
     * Updates displayed errors of currently selected data object.
     */
    updateErrors() {
        $('#rbro_style_panel .rbroFormRow').removeClass('rbroError');
        $('#rbro_style_panel .rbroErrorMessage').text('');
        let selectedObj = this.rb.getDataObject(this.selectedObjId);
        if (selectedObj !== null) {
            for (let error of selectedObj.getErrors()) {
            }
        }
    }

    getSelectedObjId() {
        return this.selectedObjId;
    }
}
