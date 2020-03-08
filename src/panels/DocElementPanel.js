import StylePanel from './StylePanel';
import CommandGroupCmd from '../commands/CommandGroupCmd';
import SetValueCmd from '../commands/SetValueCmd';
import PopupWindow from '../PopupWindow';
import * as utils from '../utils';

/**
 * Generic panel to edit all shared properties of selected document elements.
 * @class
 */
export default class DocElementPanel {
    constructor(rootElement, rb) {
        this.rootElement = rootElement;
        this.rb = rb;
    }

    render() {
        let elDiv, elFormField, elParameterButton;
        let panel = $('<div id="rbro_doc_element_panel"></div>');

        elDiv = $('<div id="rbro_doc_element_content_row" class="rbroFormRow rbroHidden"></div>');
        elDiv.append(`<label for="rbro_text_element_content">${this.rb.getLabel('textElementContent')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elContent = $(`<textarea id="rbro_doc_element_content" rows="1"></textarea>`)
            .on('input', event => {
                let cmdGroup = new CommandGroupCmd('Set value');
                let selectedObjects = this.rb.getSelectedObjects();
                for (let obj of selectedObjects) {
                    if (obj.getValue('content') !== elContent.val()) {
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), 'rbro_doc_element_content', 'content',
                            elContent.val(), SetValueCmd.type.text, this.rb));
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            })
            .blur(event => {
                this.rb.getPopupWindow().hide();
            });
        autosize(elContent);
        elFormField.append(elContent);
        elParameterButton = $('<div class="rbroButton rbroRoundButton rbroIcon-select"></div>')
            .click(event => {
                let selectedObjects = this.rb.getSelectedObjects();
                // data source parameters are not shown in case multiple objects are selected
                let selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;

                this.rb.getPopupWindow().show(
                    this.rb.getParameterItems(selectedObject), null,
                    'rbro_doc_element_content', 'content', PopupWindow.type.parameterAppend);
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_doc_element_content_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_eval_row" class="rbroFormRow rbroHidden"></div>');
        elDiv.append(`<label for="rbro_doc_element_eval">${this.rb.getLabel('textElementEval')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elEval = $('<input id="rbro_doc_element_eval" type="checkbox">')
            .change(event => {
                let cmdGroup = new CommandGroupCmd('Set value');
                let selectedObjects = this.rb.getSelectedObjects();
                let evalChecked = elEval.is(":checked");
                for (let obj of selectedObjects) {
                    if (obj.getValue('eval') !== evalChecked) {
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), 'rbro_doc_element_eval', 'eval',
                            evalChecked, SetValueCmd.type.checkbox, this.rb));
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            });
        elFormField.append(elEval);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_format_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_format">${this.rb.getLabel('barCodeElementFormat')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elFormat = $(`<select id="rbro_doc_element_format" disabled="disabled">
                <option value="CODE128">CODE128</option>
            </select>`)
            .change(event => {
                let cmdGroup = new CommandGroupCmd('Set value');
                let selectedObjects = this.rb.getSelectedObjects();
                for (let obj of selectedObjects) {
                    if (obj.getValue('format') !== elFormat.val()) {
                        cmdGroup.addCommand(new SetValueCmd(this.selectedObjId, 'rbro_doc_element_format',
                            'format', elFormat.val(), SetValueCmd.type.select, this.rb));
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            });
        elFormField.append(elFormat);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_display_value_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_display_value">${this.rb.getLabel('barCodeElementDisplayValue')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elDisplayValue = $(`<input id="rbro_doc_element_display_value" type="checkbox">`)
            .change(event => {
                let displayValueChecked = elDisplayValue.is(":checked");
                let cmdGroup = new CommandGroupCmd('Set value');
                let selectedObjects = this.rb.getSelectedObjects();
                for (let obj of selectedObjects) {
                    if (obj.getValue('displayValue') !== displayValueChecked) {
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), 'rbro_doc_element_display_value', 'displayValue',
                            displayValueChecked, SetValueCmd.type.checkbox, this.rb));
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            });
        elFormField.append(elDisplayValue);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_label_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_label">${this.rb.getLabel('docElementLabel')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elLabel = $(`<input id="rbro_doc_element_label">`)
            .on('input', event => {
                let cmdGroup = new CommandGroupCmd('Set value');
                let selectedObjects = this.rb.getSelectedObjects();
                for (let obj of selectedObjects) {
                    if (obj.getValue('label') !== elLabel.val()) {
                        let cmd = new SetValueCmd(
                            obj.getId(), 'rbro_doc_element_label',
                            'label', elLabel.val(), SetValueCmd.type.text, this.rb);
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            });
        elFormField.append(elLabel);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_position_row" class="rbroFormRow rbroHidden"></div>');
        elDiv.append(`<label for="rbro_doc_element_x">${this.rb.getLabel('docElementPosition')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit"></div>');
        let elPosX = $(`<input id="rbro_doc_element_x">`)
            .on('input', event => {
                let cmdGroup = new CommandGroupCmd('Set value');
                let selectedObjects = this.rb.getSelectedObjects();
                for (let obj of selectedObjects) {
                    if (obj.getValue('x') !== elPosX.val()) {
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), 'rbro_doc_element_x', 'x',
                            elPosX.val(), SetValueCmd.type.text, this.rb));
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            });
        utils.setInputDecimal(elPosX);
        elFormField.append(elPosX);
        let elPosY = $('<input id="rbro_doc_element_y">')
            .on('input', event => {
                let cmdGroup = new CommandGroupCmd('Set value');
                let selectedObjects = this.rb.getSelectedObjects();
                for (let obj of selectedObjects) {
                    if (obj.getValue('y') !== elPosY.val()) {
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), 'rbro_doc_element_y', 'y',
                            elPosY.val(), SetValueCmd.type.text, this.rb));
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            });
        utils.setInputDecimal(elPosY);
        elFormField.append(elPosY);
        elFormField.append('<div id="rbro_doc_element_position_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_size_row" class="rbroFormRow rbroHidden"></div>');
        elDiv.append(`<label for="rbro_doc_element_size">${this.rb.getLabel('docElementSize')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit"></div>');
        let elWidth = $(`<input id="rbro_doc_element_width">`)
            .on('input', event => {
                let cmdGroup = new CommandGroupCmd('Set value');
                let selectedObjects = this.rb.getSelectedObjects();
                for (let obj of selectedObjects) {
                    if (obj.getValue('width') !== elWidth.val()) {
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), 'rbro_doc_element_width', 'width',
                            elWidth.val(), SetValueCmd.type.text, this.rb));
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            });
        utils.setInputDecimal(elWidth);
        elFormField.append(elWidth);
        let elHeight = $(`<input id="rbro_doc_element_height">`)
            .on('input', event => {
                let cmdGroup = new CommandGroupCmd('Set value');
                let selectedObjects = this.rb.getSelectedObjects();
                for (let obj of selectedObjects) {
                    if (obj.getValue('height') !== elHeight.val()) {
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), 'rbro_doc_element_height', 'height',
                            elHeight.val(), SetValueCmd.type.text, this.rb));
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            });
        utils.setInputDecimal(elHeight);
        elFormField.append(elHeight);
        elFormField.append('<div id="rbro_doc_element_size_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_colspan_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_colspan">${this.rb.getLabel('tableElementColspan')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elColspan = $('<input id="rbro_doc_element_colspan" maxlength="1">')
            .change(event => {
                let cmdGroup = new CommandGroupCmd('Set value');
                let selectedObjects = this.rb.getSelectedObjects();
                for (let obj of selectedObjects) {
                    let val = elColspan.val().trim();
                    if (val !== '') {
                        val = utils.checkInputDecimal(val, 1, 9);
                    }
                    if (val !== elColspan.val()) {
                        elColspan.val(val);
                    }
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), 'rbro_text_element_colspan', 'colspan',
                        elColspan.val(), SetValueCmd.type.text, this.rb));
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            });
        utils.setInputPositiveInteger(elColspan);
        elFormField.append(elColspan);
        elFormField.append('<div id="rbro_doc_element_colspan_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        // ---------------------------
        // --- Style Section Begin ---
        // ---------------------------
        let elStyleSectionContainer = $('<div id="rbro_doc_element_style_section_container"></div>');
        let elStyleHeader = $('<div class="rbroPanelSectionHeader"></div>');
        let elStyleHeaderIcon = $(
            '<span id="rbro_doc_element_style_header_icon" class="rbroPanelSectionHeaderOpen rbroIcon-minus"></span>');
        elDiv = $(
            `<div id="rbro_doc_element_style_header"
             class="rbroFormRow rbroPanelSection rbroPanelSectionHeaderOpen"></div>`)
            .click(event => {
                $('#rbro_doc_element_style_header').toggleClass('rbroPanelSectionHeaderOpen');
                $('#rbro_doc_element_style_section').toggleClass('rbroHidden');
                elStyleHeaderIcon.toggleClass('rbroIcon-plus');
                elStyleHeaderIcon.toggleClass('rbroIcon-minus');
                if (elStyleHeaderIcon.hasClass('rbroIcon-minus')) {
                    $('#rbro_detail_panel').scrollTop(
                        $('#rbro_detail_panel').scrollTop() + elStyleHeader.position().top);
                }
            });
        elStyleHeader.append(elStyleHeaderIcon);
        elStyleHeader.append(`<span>${this.rb.getLabel('docElementStyle')}</span>`);
        elDiv.append(elStyleHeader);
        elStyleSectionContainer.append(elDiv);

        let elStyleSectionDiv = $('<div id="rbro_doc_element_style_section"></div>');
        elDiv = $('<div id="rbro_doc_element_style_id_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_style_id">${this.rb.getLabel('docElementStyle')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elStyle = $('<select id="rbro_doc_element_style_id"></select>')
            .change(event => {
                let cmdGroup = new CommandGroupCmd('Set value');
                let selectedObjects = this.rb.getSelectedObjects();
                for (let obj of selectedObjects) {
                    if (obj.getValue('styleId') !== elStyle.val()) {
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), 'rbro_doc_element_style_id', 'styleId',
                            elStyle.val(), SetValueCmd.type.select, this.rb));
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            });
        elFormField.append(elStyle);
        elDiv.append(elFormField);
        elStyleSectionDiv.append(elDiv);

        let elStyleDiv = $('<div id="rbro_doc_element_style_settings"></div>');
        StylePanel.renderStyle(elStyleDiv, 'doc_element_', '', this.rb);
        elStyleSectionDiv.append(elStyleDiv);
        elStyleSectionContainer.append(elStyleSectionDiv);
        panel.append(elStyleSectionContainer);
        // -------------------------
        // --- Style Section End ---
        // -------------------------

        // ---------------------------
        // --- Print Section Begin ---
        // ---------------------------
        let elPrintSectionContainer = $('<div id="rbro_doc_element_print_section_container"></div>');
        let elPrintHeader = $('<div class="rbroPanelSectionHeader"></div>');
        let elPrintHeaderIcon = $('<span id="rbro_doc_element_print_header_icon" class="rbroIcon-plus"></span>');
        elDiv = $('<div id="rbro_doc_element_print_header" class="rbroFormRow rbroPanelSection"></div>')
            .click(event => {
                $('#rbro_doc_element_print_header').toggleClass('rbroPanelSectionHeaderOpen');
                $('#rbro_doc_element_print_section').toggleClass('rbroHidden');
                elPrintHeaderIcon.toggleClass('rbroIcon-plus');
                elPrintHeaderIcon.toggleClass('rbroIcon-minus');
                if (elPrintHeaderIcon.hasClass('rbroIcon-minus')) {
                    $('#rbro_detail_panel').scrollTop(
                        $('#rbro_detail_panel').scrollTop() + elPrintHeader.position().top);
                }
                autosize.update($('#rbro_doc_element_print_if'));
            });
        elPrintHeader.append(elPrintHeaderIcon);
        elPrintHeader.append(`<span>${this.rb.getLabel('docElementPrintSettings')}</span>`);
        elDiv.append(elPrintHeader);
        elPrintSectionContainer.append(elDiv);

        let elPrintSectionDiv = $('<div id="rbro_doc_element_print_section" class="rbroHidden"></div>');
        elDiv = $('<div id="rbro_doc_element_print_if_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_print_if">${this.rb.getLabel('docElementPrintIf')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elPrintIf = $(`<textarea id="rbro_doc_element_print_if" rows="1"></textarea>`)
            .on('input', event => {
                let cmdGroup = new CommandGroupCmd('Set value');
                let selectedObjects = this.rb.getSelectedObjects();
                for (let obj of selectedObjects) {
                    if (obj.getValue('printIf') !== elPrintIf.val()) {
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), 'rbro_doc_element_print_if', 'printIf',
                            elPrintIf.val(), SetValueCmd.type.text, this.rb));
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            });
        autosize(elPrintIf);
        elFormField.append(elPrintIf);
        elParameterButton = $('<div class="rbroButton rbroRoundButton rbroIcon-select"></div>')
            .click(event => {
                let selectedObjects = this.rb.getSelectedObjects();
                // data source parameters are not shown in case multiple objects are selected
                let selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;

                this.rb.getPopupWindow().show(
                    this.rb.getParameterItems(selectedObject), null,
                    'rbro_doc_element_print_if', 'printIf', PopupWindow.type.parameterAppend);
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_doc_element_print_if_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_remove_empty_element_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_remove_empty_element">
                      ${this.rb.getLabel('docElementRemoveEmptyElement')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elRemoveEmptyElement = $(`<input id="rbro_doc_element_remove_empty_element" type="checkbox">`)
            .change(event => {
                let removeEmptyElementChecked = elRemoveEmptyElement.is(":checked");
                let cmdGroup = new CommandGroupCmd('Set value');
                let selectedObjects = this.rb.getSelectedObjects();
                for (let obj of selectedObjects) {
                    if (obj.getValue('removeEmptyElement') !== removeEmptyElementChecked) {
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), 'rbro_doc_element_remove_empty_element', 'removeEmptyElement',
                            removeEmptyElementChecked, SetValueCmd.type.checkbox, this.rb));
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            });
        elFormField.append(elRemoveEmptyElement);
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_always_print_on_same_page_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_always_print_on_same_page">
                      ${this.rb.getLabel('docElementAlwaysPrintOnSamePage')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elAlwaysPrintOnSamePage = $(`<input id="rbro_doc_element_always_print_on_same_page" type="checkbox">`)
            .change(event => {
                let alwaysPrintOnSamePageChecked = elAlwaysPrintOnSamePage.is(":checked");
                let cmdGroup = new CommandGroupCmd('Set value');
                let selectedObjects = this.rb.getSelectedObjects();
                for (let obj of selectedObjects) {
                    if (obj.getValue('alwaysPrintOnSamePage') !== alwaysPrintOnSamePageChecked) {
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), 'rbro_doc_element_always_print_on_same_page', 'alwaysPrintOnSamePage',
                            alwaysPrintOnSamePageChecked, SetValueCmd.type.checkbox, this.rb));
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            });
        elFormField.append(elAlwaysPrintOnSamePage);
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_shrink_to_content_height_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_shrink_to_content_height">
                      ${this.rb.getLabel('frameElementShrinkToContentHeight')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elShrinkToContentHeight = $(`<input id="rbro_doc_element_shrink_to_content_height" type="checkbox">`)
            .change(event => {
                let shrinkToContentHeightChecked = elShrinkToContentHeight.is(":checked");
                let cmdGroup = new CommandGroupCmd('Set value');
                let selectedObjects = this.rb.getSelectedObjects();
                for (let obj of selectedObjects) {
                    if (obj.getValue('shrinkToContentHeight') !== shrinkToContentHeightChecked) {
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), 'rbro_doc_element_shrink_to_content_height', 'shrinkToContentHeight',
                            shrinkToContentHeightChecked, SetValueCmd.type.checkbox, this.rb));
                    }
                }
            });
        elFormField.append(elShrinkToContentHeight);
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_pattern_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_pattern">${this.rb.getLabel('textElementPattern')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elPattern = $(`<input id="rbro_doc_element_pattern">`)
            .on('input', event => {
                let cmdGroup = new CommandGroupCmd('Set value');
                let selectedObjects = this.rb.getSelectedObjects();
                for (let obj of selectedObjects) {
                    if (obj.getValue('pattern') !== elPattern.val()) {
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), 'rbro_doc_element_pattern', 'pattern',
                            elPattern.val(), SetValueCmd.type.text, this.rb));
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            });
        elFormField.append(elPattern);
        elParameterButton = $('<div class="rbroButton rbroRoundButton rbroIcon-select"></div>')
            .click(event => {
                this.rb.getPopupWindow().show(
                    this.rb.getPatterns(), null, 'rbro_doc_element_pattern', 'pattern', PopupWindow.type.pattern);
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_doc_element_pattern_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_link_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_link">${this.rb.getLabel('docElementLink')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elLink = $(`<input id="rbro_doc_element_link">`)
            .on('input', event => {
                let cmdGroup = new CommandGroupCmd('Set value');
                let selectedObjects = this.rb.getSelectedObjects();
                for (let obj of selectedObjects) {
                    if (obj.getValue('link') !== elLink.val()) {
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), 'rbro_doc_element_link', 'link',
                            elLink.val(), SetValueCmd.type.text, this.rb));
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            });
        elFormField.append(elLink);
        elParameterButton = $('<div class="rbroButton rbroRoundButton rbroIcon-select"></div>')
            .click(event => {
                let selectedObjects = this.rb.getSelectedObjects();
                // data source parameters are not shown in case multiple objects are selected
                let selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;

                this.rb.getPopupWindow().show(
                    this.rb.getParameterItems(selectedObject), null,
                    'rbro_doc_element_link', 'link', PopupWindow.type.parameterSet);
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_doc_element_link_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);
        elPrintSectionContainer.append(elPrintSectionDiv);
        panel.append(elPrintSectionContainer);
        // -------------------------
        // --- Print Section End ---
        // -------------------------

        // ---------------------------------------
        // --- Conditional Style Section Begin ---
        // ---------------------------------------
        let elCsStyleSectionContainer = $('<div id="rbro_doc_element_cs_style_section_container"></div>');
        let elCsStyleHeader = $('<div class="rbroPanelSectionHeader"></div>');
        let elCsStyleHeaderIcon = $(
            '<span id="rbro_doc_element_cs_style_header_icon" class="rbroIcon-plus"></span>');
        elDiv = $(
            `<div id="rbro_doc_element_cs_style_header"
             class="rbroFormRow rbroPanelSection rbroPanelSectionHeaderOpen"></div>`)
            .click(event => {
                $('#rbro_doc_element_cs_style_header').toggleClass('rbroPanelSectionHeaderOpen');
                $('#rbro_doc_element_cs_style_section').toggleClass('rbroHidden');
                elCsStyleHeaderIcon.toggleClass('rbroIcon-plus');
                elCsStyleHeaderIcon.toggleClass('rbroIcon-minus');
                if (elCsStyleHeaderIcon.hasClass('rbroIcon-minus')) {
                    $('#rbro_detail_panel').scrollTop(
                        $('#rbro_detail_panel').scrollTop() + elStyleHeader.position().top);
                }
            });
        elCsStyleHeader.append(elCsStyleHeaderIcon);
        elCsStyleHeader.append(`<span>${this.rb.getLabel('docElementConditionalStyle')}</span>`);
        elDiv.append(elCsStyleHeader);
        elCsStyleSectionContainer.append(elDiv);

        let elCsStyleSectionDiv = $('<div id="rbro_doc_element_cs_style_section" class="rbroHidden"></div>');
        elDiv = $('<div id="rbro_doc_element_cs_style_id_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_cs_style_id">${this.rb.getLabel('docElementStyle')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elCsStyle = $('<select id="rbro_doc_element_cs_style_id"></select>')
            .change(event => {
                let cmdGroup = new CommandGroupCmd('Set value');
                let selectedObjects = this.rb.getSelectedObjects();
                for (let obj of selectedObjects) {
                    if (obj.getValue('cs_styleId') !== elCsStyle.val()) {
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), 'rbro_doc_element_cs_style_id', 'cs_styleId',
                            elCsStyle.val(), SetValueCmd.type.select, this.rb));
                    }
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            });
        elFormField.append(elCsStyle);
        elDiv.append(elFormField);
        elCsStyleSectionDiv.append(elDiv);

        let elCsStyleDiv = $('<div id="rbro_doc_element_cs_style_settings"></div>');
        StylePanel.renderStyle(elCsStyleDiv, 'doc_element_', 'cs_', this.rb);
        elCsStyleSectionDiv.append(elCsStyleDiv);
        elCsStyleSectionContainer.append(elCsStyleSectionDiv);
        panel.append(elCsStyleSectionContainer);
        // -------------------------------------
        // --- Conditional Style Section End ---
        // -------------------------------------

        if (this.rb.getProperty('enableSpreadsheet')) {
            // ---------------------------------
            // --- Spreadsheet Section Begin ---
            // ---------------------------------
            let elSpreadsheetSectionContainer = $('<div id="rbro_doc_element_spreadsheet_section_container"></div>');
            let elSpreadsheetHeader = $('<div class="rbroPanelSectionHeader"></div>');
            let elSpreadsheetHeaderIcon = $(
                '<span id="rbro_doc_element_spreadsheet_header_icon" class="rbroIcon-plus"></span>');
            elDiv = $('<div id="rbro_doc_element_spreadsheet_header" class="rbroFormRow rbroPanelSection"></div>')
                .click(event => {
                    $('#rbro_doc_element_spreadsheet_header').toggleClass('rbroPanelSectionHeaderOpen');
                    $('#rbro_doc_element_spreadsheet_section').toggleClass('rbroHidden');
                    elSpreadsheetHeaderIcon.toggleClass('rbroIcon-plus');
                    elSpreadsheetHeaderIcon.toggleClass('rbroIcon-minus');
                    if (elSpreadsheetHeaderIcon.hasClass('rbroIcon-minus')) {
                        $('#rbro_detail_panel').scrollTop(
                            $('#rbro_detail_panel').scrollTop() + elSpreadsheetHeader.position().top);
                    }
                });
            elSpreadsheetHeader.append(elSpreadsheetHeaderIcon);
            elSpreadsheetHeader.append(`<span>${this.rb.getLabel('docElementSpreadsheet')}</span>`);
            elDiv.append(elSpreadsheetHeader);
            elSpreadsheetSectionContainer.append(elDiv);

            let elSpreadsheetSectionDiv = $('<div id="rbro_doc_element_spreadsheet_section" class="rbroHidden"></div>');
            elDiv = $('<div id="rbro_doc_element_spreadsheet_hide_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_doc_element_spreadsheet_hide">
                          ${this.rb.getLabel('docElementSpreadsheetHide')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetHide = $(`<input id="rbro_doc_element_spreadsheet_hide" type="checkbox">`)
                .change(event => {
                    let spreadsheetHideChecked = elSpreadsheetHide.is(":checked");
                    let cmdGroup = new CommandGroupCmd('Set value');
                    let selectedObjects = this.rb.getSelectedObjects();
                    for (let obj of selectedObjects) {
                        if (obj.getValue('spreadsheet_hide') !== spreadsheetHideChecked) {
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), 'rbro_doc_element_spreadsheet_hide', 'spreadsheet_hide',
                                spreadsheetHideChecked, SetValueCmd.type.checkbox, this.rb));
                        }
                    }
                    if (!cmdGroup.isEmpty()) {
                        this.rb.executeCommand(cmdGroup);
                    }
                });
            elFormField.append(elSpreadsheetHide);
            elDiv.append(elFormField);
            elSpreadsheetSectionDiv.append(elDiv);

            elDiv = $('<div id="rbro_doc_element_spreadsheet_column_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_doc_element_spreadsheet_column">${this.rb.getLabel('docElementSpreadsheetColumn')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetColumn = $(`<input id="rbro_doc_element_spreadsheet_column">`)
                .on('input', event => {
                    let cmdGroup = new CommandGroupCmd('Set value');
                    let selectedObjects = this.rb.getSelectedObjects();
                    for (let obj of selectedObjects) {
                        if (obj.getValue('spreadsheet_column') !== elSpreadsheetColumn.val()) {
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), 'rbro_doc_element_spreadsheet_column', 'spreadsheet_column',
                                elSpreadsheetColumn.val(), SetValueCmd.type.text, this.rb));
                        }
                    }
                    if (!cmdGroup.isEmpty()) {
                        this.rb.executeCommand(cmdGroup);
                    }
                });
            utils.setInputPositiveInteger(elSpreadsheetColumn);
            elFormField.append(elSpreadsheetColumn);
            elFormField.append('<div id="rbro_doc_element_spreadsheet_column_error" class="rbroErrorMessage"></div>');
            elDiv.append(elFormField);
            elSpreadsheetSectionDiv.append(elDiv);

            elDiv = $('<div id="rbro_doc_element_spreadsheet_colspan_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_doc_element_spreadsheet_colspan">${this.rb.getLabel('docElementSpreadsheetColspan')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetColspan = $(`<input id="rbro_doc_element_spreadsheet_colspan">`)
                .on('input', event => {
                    let cmdGroup = new CommandGroupCmd('Set value');
                    let selectedObjects = this.rb.getSelectedObjects();
                    for (let obj of selectedObjects) {
                        if (obj.getValue('spreadsheet_colspan') !== elSpreadsheetColspan.val()) {
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), 'rbro_doc_element_spreadsheet_colspan', 'spreadsheet_colspan',
                                elSpreadsheetColspan.val(), SetValueCmd.type.text, this.rb));
                        }
                    }
                    if (!cmdGroup.isEmpty()) {
                        this.rb.executeCommand(cmdGroup);
                    }
                });
            utils.setInputPositiveInteger(elSpreadsheetColspan);
            elFormField.append(elSpreadsheetColspan);
            elFormField.append('<div id="rbro_doc_element_spreadsheet_colspan_error" class="rbroErrorMessage"></div>');
            elDiv.append(elFormField);
            elSpreadsheetSectionDiv.append(elDiv);

            elDiv = $('<div id="rbro_doc_element_spreadsheet_add_empty_row_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_doc_element_spreadsheet_add_empty_row">${this.rb.getLabel('docElementSpreadsheetAddEmptyRow')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetAddEmptyRow = $(`<input id="rbro_doc_element_spreadsheet_add_empty_row" type="checkbox">`)
                .change(event => {
                    let spreadsheetAddEmptyRowChecked = elSpreadsheetAddEmptyRow.is(":checked");
                    let cmdGroup = new CommandGroupCmd('Set value');
                    let selectedObjects = this.rb.getSelectedObjects();
                    for (let obj of selectedObjects) {
                        if (obj.getValue('spreadsheet_addEmptyRow') !== spreadsheetAddEmptyRowChecked) {
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), 'rbro_doc_element_spreadsheet_add_empty_row', 'spreadsheet_addEmptyRow',
                                spreadsheetAddEmptyRowChecked, SetValueCmd.type.checkbox, this.rb));
                        }
                    }
                    if (!cmdGroup.isEmpty()) {
                        this.rb.executeCommand(cmdGroup);
                    }
                });
            elFormField.append(elSpreadsheetAddEmptyRow);
            elDiv.append(elFormField);
            elSpreadsheetSectionDiv.append(elDiv);
            elSpreadsheetSectionContainer.append(elSpreadsheetSectionDiv);
            panel.append(elSpreadsheetSectionContainer);
            // -------------------------------
            // --- Spreadsheet Section End ---
            // -------------------------------
        }


        $('#rbro_detail_panel').append(panel);
    }

    updateDisplay() {
        let selectedObjects = this.rb.getSelectedObjects();
        let propertyDescriptors = {
            'content': {
                'type': SetValueCmd.type.text,
                'fieldId': 'content'
            },
            'eval': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'eval'
            },
            'x': {
                'type': SetValueCmd.type.text,
                'fieldId': 'x',
                'rowId': 'rbro_doc_element_position_row',
                'rowProperties': ['x', 'y']
            },
            'y': {
                'type': SetValueCmd.type.text,
                'fieldId': 'y',
                'rowId': 'rbro_doc_element_position_row'
            },
            'width': {
                'type': SetValueCmd.type.text,
                'fieldId': 'width',
                'rowId': 'rbro_doc_element_size_row',
                'rowProperties': ['width', 'height']
            },
            'height': {
                'type': SetValueCmd.type.text,
                'fieldId': 'height',
                'rowId': 'rbro_doc_element_size_row'
            },
            'colspan': {
                'type': SetValueCmd.type.text,
                'fieldId': 'colspan'
            },
            'format': {
                'type': SetValueCmd.type.select,
                'fieldId': 'format'
            },
            'displayValue': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'display_value'
            },
            'label': {
                'type': SetValueCmd.type.text,
                'fieldId': 'label'
            },
            'styleId': {
                'type': SetValueCmd.type.select,
                'fieldId': 'style_id',
                'section': 'style'
            },
            'bold': {
                'type': SetValueCmd.type.button,
                'fieldId': 'bold',
                'rowId': 'rbro_doc_element_textstyle_row',
                'rowProperties': ['bold', 'italic', 'underline', 'strikethrough'],
                'section': 'style'
            },
            'italic': {
                'type': SetValueCmd.type.button,
                'fieldId': 'italic',
                'rowId': 'rbro_doc_element_textstyle_row',
                'section': 'style'
            },
            'underline': {
                'type': SetValueCmd.type.button,
                'fieldId': 'underline',
                'rowId': 'rbro_doc_element_textstyle_row',
                'section': 'style'
            },
            'strikethrough': {
                'type': SetValueCmd.type.button,
                'fieldId': 'strikethrough',
                'rowId': 'rbro_doc_element_textstyle_row',
                'section': 'style'
            },
            'horizontalAlignment': {
                'type': SetValueCmd.type.buttonGroup,
                'fieldId': 'halignment',
                'rowId': 'rbro_doc_element_alignment_row',
                'rowProperties': ['horizontalAlignment', 'verticalAlignment'],
                'section': 'style'
            },
            'verticalAlignment': {
                'type': SetValueCmd.type.buttonGroup,
                'fieldId': 'valignment',
                'rowId': 'rbro_doc_element_alignment_row',
                'section': 'style'
            },
            'textColor': {
                'type': SetValueCmd.type.color,
                'allowEmpty': false,
                'fieldId': 'text_color',
                'section': 'style'
            },
            'backgroundColor': {
                'type': SetValueCmd.type.color,
                'allowEmpty': true,
                'fieldId': 'background_color',
                'section': 'style'
            },
            'font': {
                'type': SetValueCmd.type.select,
                'fieldId': 'font',
                'rowId': 'rbro_doc_element_font_row',
                'rowProperties': ['font', 'fontSize'],
                'section': 'style'
            },
            'fontSize': {
                'type': SetValueCmd.type.select,
                'fieldId': 'font_size',
                'rowId': 'rbro_doc_element_font_row',
                'section': 'style'
            },
            'lineSpacing': {
                'type': SetValueCmd.type.select,
                'fieldId': 'line_spacing',
                'section': 'style'
            },
            'borderAll': {
                'type': SetValueCmd.type.button,
                'fieldId': 'border_all',
                'rowId': 'rbro_doc_element_border_row',
                'rowProperties': ['borderAll', 'borderLeft', 'borderTop', 'borderRight', 'borderBottom'],
                'section': 'style'
            },
            'borderLeft': {
                'type': SetValueCmd.type.button,
                'fieldId': 'border_left',
                'rowId': 'rbro_doc_element_border_row',
                'section': 'style'
            },
            'borderTop': {
                'type': SetValueCmd.type.button,
                'fieldId': 'border_top',
                'rowId': 'rbro_doc_element_border_row',
                'section': 'style'
            },
            'borderRight': {
                'type': SetValueCmd.type.button,
                'fieldId': 'border_right',
                'rowId': 'rbro_doc_element_border_row',
                'section': 'style'
            },
            'borderBottom': {
                'type': SetValueCmd.type.button,
                'fieldId': 'border_bottom',
                'rowId': 'rbro_doc_element_border_row',
                'section': 'style'
            },
            'borderColor': {
                'type': SetValueCmd.type.color,
                'allowEmpty': false,
                'fieldId': 'border_color',
                'section': 'style'
            },
            'borderWidth': {
                'type': SetValueCmd.type.text,
                'fieldId': 'border_width',
                'section': 'style'
            },
            'paddingLeft': {
                'type': SetValueCmd.type.text,
                'fieldId': 'padding_left',
                'rowId': 'rbro_doc_element_padding_row',
                'rowProperties': ['paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom'],
                'section': 'style'
            },
            'paddingTop': {
                'type': SetValueCmd.type.text,
                'fieldId': 'padding_top',
                'rowId': 'rbro_doc_element_padding_row',
                'section': 'style'
            },
            'paddingRight': {
                'type': SetValueCmd.type.text,
                'fieldId': 'padding_right',
                'rowId': 'rbro_doc_element_padding_row',
                'section': 'style'
            },
            'paddingBottom': {
                'type': SetValueCmd.type.text,
                'fieldId': 'padding_bottom',
                'rowId': 'rbro_doc_element_padding_row',
                'section': 'style'
            },
            'printIf': {
                'type': SetValueCmd.type.text,
                'fieldId': 'print_if',
                'section': 'print'
            },
            'removeEmptyElement': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'remove_empty_element',
                'section': 'print'
            },
            'alwaysPrintOnSamePage': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'always_print_on_same_page',
                'section': 'print'
            },
            'shrinkToContentHeight': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'shrink_to_content_height',
                'section': 'print'
            },
            'pattern': {
                'type': SetValueCmd.type.text,
                'fieldId': 'pattern',
                'section': 'print'
            },
            'link': {
                'type': SetValueCmd.type.text,
                'fieldId': 'link',
                'section': 'print'
            },
            'cs_condition': {
                'type': SetValueCmd.type.text,
                'fieldId': 'cs_condition',
                'section': 'cs_style'
            },
            'cs_styleId': {
                'type': SetValueCmd.type.select,
                'fieldId': 'cs_style_id',
                'section': 'cs_style'
            },
            'cs_bold': {
                'type': SetValueCmd.type.button,
                'fieldId': 'cs_bold',
                'rowId': 'rbro_doc_element_cs_textstyle_row',
                'rowProperties': ['cs_bold', 'cs_italic', 'cs_underline', 'cs_strikethrough'],
                'section': 'cs_style'
            },
            'cs_italic': {
                'type': SetValueCmd.type.button,
                'fieldId': 'cs_italic',
                'rowId': 'rbro_doc_element_cs_textstyle_row',
                'section': 'cs_style'
            },
            'cs_underline': {
                'type': SetValueCmd.type.button,
                'fieldId': 'cs_underline',
                'rowId': 'rbro_doc_element_cs_textstyle_row',
                'section': 'cs_style'
            },
            'cs_strikethrough': {
                'type': SetValueCmd.type.button,
                'fieldId': 'cs_strikethrough',
                'rowId': 'rbro_doc_element_cs_textstyle_row',
                'section': 'cs_style'
            },
            'cs_horizontalAlignment': {
                'type': SetValueCmd.type.buttonGroup,
                'fieldId': 'cs_horizontal_alignment',
                'rowId': 'rbro_doc_element_cs_alignment_row',
                'rowProperties': ['cs_horizontalAlignment', 'cs_verticalAlignment'],
                'section': 'cs_style'
            },
            'cs_verticalAlignment': {
                'type': SetValueCmd.type.buttonGroup,
                'fieldId': 'cs_vertical_alignment',
                'rowId': 'rbro_doc_element_cs_alignment_row',
                'section': 'cs_style'
            },
            'cs_textColor': {
                'type': SetValueCmd.type.color,
                'allowEmpty': false,
                'fieldId': 'cs_text_color',
                'section': 'cs_style'
            },
            'cs_backgroundColor': {
                'type': SetValueCmd.type.color,
                'allowEmpty': true,
                'fieldId': 'cs_background_color',
                'section': 'cs_style'
            },
            'cs_font': {
                'type': SetValueCmd.type.select,
                'fieldId': 'cs_font',
                'rowId': 'rbro_doc_element_cs_font_row',
                'rowProperties': ['cs_font', 'cs_fontSize'],
                'section': 'cs_style'
            },
            'cs_fontSize': {
                'type': SetValueCmd.type.select,
                'fieldId': 'cs_font_size',
                'rowId': 'rbro_doc_element_cs_font_row',
                'section': 'cs_style'
            },
            'cs_lineSpacing': {
                'type': SetValueCmd.type.select,
                'fieldId': 'cs_line_spacing',
                'section': 'cs_style'
            },
            'cs_borderAll': {
                'type': SetValueCmd.type.button,
                'fieldId': 'cs_border_all',
                'rowId': 'rbro_doc_element_cs_border_row',
                'rowProperties': [
                    'cs_borderAll', 'cs_borderLeft', 'cs_borderTop', 'cs_borderRight', 'cs_borderBottom'
                ],
                'section': 'cs_style'
            },
            'cs_borderLeft': {
                'type': SetValueCmd.type.button,
                'fieldId': 'cs_border_left',
                'rowId': 'rbro_doc_element_cs_border_row',
                'section': 'cs_style'
            },
            'cs_borderTop': {
                'type': SetValueCmd.type.button,
                'fieldId': 'cs_border_top',
                'rowId': 'rbro_doc_element_cs_border_row',
                'section': 'cs_style'
            },
            'cs_borderRight': {
                'type': SetValueCmd.type.button,
                'fieldId': 'cs_border_right',
                'rowId': 'rbro_doc_element_cs_border_row',
                'section': 'cs_style'
            },
            'cs_borderBottom': {
                'type': SetValueCmd.type.button,
                'fieldId': 'cs_border_bottom',
                'rowId': 'rbro_doc_element_cs_border_row',
                'section': 'cs_style'
            },
            'cs_borderColor': {
                'type': SetValueCmd.type.color,
                'allowEmpty': false,
                'fieldId': 'cs_border_color',
                'section': 'cs_style'
            },
            'cs_borderWidth': {
                'type': SetValueCmd.type.text,
                'fieldId': 'cs_border_width',
                'section': 'cs_style'
            },
            'cs_paddingLeft': {
                'type': SetValueCmd.type.text,
                'fieldId': 'cs_padding_left',
                'rowId': 'rbro_doc_element_cs_padding_row',
                'rowProperties': ['paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom'],
                'section': 'cs_style'
            },
            'cs_paddingTop': {
                'type': SetValueCmd.type.text,
                'fieldId': 'cs_padding_top',
                'rowId': 'rbro_doc_element_cs_padding_row',
                'section': 'cs_style'
            },
            'cs_paddingRight': {
                'type': SetValueCmd.type.text,
                'fieldId': 'cs_padding_right',
                'rowId': 'rbro_doc_element_cs_padding_row',
                'section': 'cs_style'
            },
            'cs_paddingBottom': {
                'type': SetValueCmd.type.text,
                'fieldId': 'cs_padding_bottom',
                'rowId': 'rbro_doc_element_cs_padding_row',
                'section': 'cs_style'
            },
            'spreadsheet_hide': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'spreadsheet_hide',
                'section': 'spreadsheet'
            },
            'spreadsheet_column': {
                'type': SetValueCmd.type.text,
                'fieldId': 'spreadsheet_column',
                'section': 'spreadsheet'
            },
            'spreadsheet_colspan': {
                'type': SetValueCmd.type.text,
                'fieldId': 'spreadsheet_colspan',
                'section': 'spreadsheet'
            },
            'spreadsheet_addEmptyRow': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'spreadsheet_add_empty_row',
                'section': 'spreadsheet'
            }
        };

        let sectionPropertyCount = {};
        let sharedProperties = {};
        for (let obj of selectedObjects) {
            let properties = obj.getProperties();
            for (let property of properties) {
                if (property in sharedProperties) {
                    sharedProperties[property] += 1;
                } else {
                    sharedProperties[property] = 1;
                }
            }
        }

        // show/hide property depending if it is available in all selected objects
        for (let property in propertyDescriptors) {
            if (propertyDescriptors.hasOwnProperty(property)) {
                let propertyDescriptor = propertyDescriptors[property];
                let show = false;
                let propertyId = `#rbro_doc_element_${propertyDescriptor['fieldId']}`;
                if (property in sharedProperties) {
                    if (sharedProperties[property] === selectedObjects.length) {
                        let value = null;
                        let differentValues = false;
                        for (let obj of selectedObjects) {
                            let objValue = obj.getValue(property);
                            if (value === null) {
                                value = objValue;
                            } else if (objValue !== value) {
                                differentValues = true;
                                break;
                            }
                        }

                        // set value for current property
                        if (propertyDescriptor['type'] === SetValueCmd.type.text) {
                            if (differentValues) {
                                $(propertyId).val('');
                                $(propertyId).attr('placeholder', 'different values ...');
                            } else {
                                $(propertyId).val(value);
                                $(propertyId).attr('placeholder', '');
                            }
                        } else if (propertyDescriptor['type'] === SetValueCmd.type.checkbox) {
                            if (differentValues) {
                                $(propertyId).prop('checked', false);
                                $(propertyId).addClass('rbroDifferentValues');
                            } else {
                                $(propertyId).prop('checked', value);
                                $(propertyId).removeClass('rbroDifferentValues');
                            }
                        } else if (propertyDescriptor['type'] === SetValueCmd.type.button) {
                            if (differentValues) {
                                $(propertyId).removeClass('rbroButtonActive').addClass('rbroDifferentValues');
                            } else {
                                if (value) {
                                    $(propertyId).addClass('rbroButtonActive');
                                } else {
                                    $(propertyId).removeClass('rbroButtonActive');
                                }
                                $(propertyId).removeClass('rbroDifferentValues');
                            }
                        } else if (propertyDescriptor['type'] === SetValueCmd.type.buttonGroup) {
                            $(propertyId).find('button').removeClass('rbroButtonActive');
                            if (!differentValues) {
                                $(propertyId).find(`button[value="${value}"]`).addClass('rbroButtonActive');
                            }
                        } else if (propertyDescriptor['type'] === SetValueCmd.type.color) {
                            if (differentValues) {
                                if (propertyDescriptor['allowEmpty']) {
                                    $(propertyId).spectrum("set", '');
                                } else {
                                    $(propertyId).spectrum("set", '#000000');
                                }
                                $(propertyId).addClass('rbroDifferentValues');
                            } else {
                                $(propertyId).spectrum("set", value);
                                $(propertyId).removeClass('rbroDifferentValues');
                            }
                        }


                        if ('section' in propertyDescriptor) {
                            let sectionName = propertyDescriptor['section'];
                            if (sectionName in sectionPropertyCount) {
                                sectionPropertyCount[sectionName] += 1;
                            } else {
                                sectionPropertyCount[sectionName] = 1;
                            }
                        }
                        show = true;
                    } else {
                        delete sharedProperties[property];
                    }
                }

                // only handle row visibility if rowId is not set, otherwise visibility will be handled
                // below, e.g. for button groups
                if (!('rowId' in propertyDescriptor)) {
                    let propertyRowId = propertyId + '_row';
                    if (show) {
                        $(propertyRowId).removeClass('rbroHidden');
                    } else {
                        $(propertyRowId).addClass('rbroHidden');
                    }
                }
            }
        }

        // sharedProperties now only contains properties shared by all objects

        for (let property in propertyDescriptors) {
            if (propertyDescriptors.hasOwnProperty(property)) {
                let propertyDescriptor = propertyDescriptors[property];
                if ('rowId' in propertyDescriptor && 'rowProperties' in propertyDescriptor) {
                    let show = false;
                    for (let rowProperty of propertyDescriptor['rowProperties']) {
                        if (rowProperty in sharedProperties) {
                            show = true;
                            break;
                        }
                    }
                    if (show) {
                        $('#' + propertyDescriptor['rowId']).removeClass('rbroHidden');
                    } else {
                        $('#' + propertyDescriptor['rowId']).addClass('rbroHidden');
                    }
                }
            }
        }

        // show/hide sections
        if ('style' in sectionPropertyCount) {
            $('#rbro_doc_element_style_section_container').removeClass('rbroHidden');
        } else {
            $('#rbro_doc_element_style_section_container').addClass('rbroHidden');
        }
        if ('print' in sectionPropertyCount) {
            $('#rbro_doc_element_print_section_container').removeClass('rbroHidden');
        } else {
            $('#rbro_doc_element_print_section_container').addClass('rbroHidden');
        }
        if ('cs_style' in sectionPropertyCount) {
            $('#rbro_doc_element_cs_style_section_container').removeClass('rbroHidden');
        } else {
            $('#rbro_doc_element_cs_style_section_container').addClass('rbroHidden');
        }

        DocElementPanel.updateAutosizeInputs();
    }

    static updateAutosizeInputs() {
        autosize.update($('#rbro_doc_element_content'));
        autosize.update($('#rbro_doc_element_print_if'));
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
    updateErrors(errors, displayedObjectId) {
        $('#rbro_doc_element_panel .rbroFormRow').removeClass('rbroError');
        $('#rbro_doc_element_panel .rbroPanelSection').removeClass('rbroError');
        $('#rbro_doc_element_panel .rbroErrorMessage').text('');

        for (let error of errors) {
            if (error.object_id === displayedObjectId) {
                let rowId = 'rbro_line_element_' + error.field + '_row';
                let errorId = 'rbro_line_element_' + error.field + '_error';
                let errorMsg = this.rb.getLabel(error.msg_key);
                if (error.info) {
                    errorMsg = errorMsg.replace('${info}', '<span class="rbroErrorMessageInfo">' +
                        error.info.replace('<', '&lt;').replace('>', '&gt;') + '</span>');
                }
                $('#' + rowId).addClass('rbroError');
                $('#' + errorId).html(errorMsg);
            }
        }
    }

    /**
     * Is called when the selected element was changed.
     */
    selectionChanged() {
        this.updateDisplay();
    }
}
