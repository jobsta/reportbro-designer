import Command from '../commands/Command';
import SetValueCmd from '../commands/SetValueCmd';
import DocumentProperties from '../data/DocumentProperties';
import * as utils from '../utils';

/**
 * Panel to edit all document properties.
 * @class
 */
export default class DocumentPropertiesPanel {
    constructor(documentProperties, rootElement, rb) {
        this.documentProperties = documentProperties;
        this.rootElement = rootElement;
        this.rb = rb;
    }

    render(data) {
        let panel = $('<div id="rbro_document_properties_panel" class="rbroHidden"></div>');
        let elDiv = $('<div id="rbro_document_properties_page_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_document_properties_page_format">${this.rb.getLabel('pageFormat')}:</label>`);
        let elFormField = $('<div class="rbroFormField"></div>');
        let elPageFormat = $(`<select id="rbro_document_properties_page_format">
                <option value="A4">${this.rb.getLabel('pageFormatA4')}</option>
                <option value="A5">${this.rb.getLabel('pageFormatA5')}</option>
                <option value="letter">${this.rb.getLabel('pageFormatLetter')}</option>
                <option value="user_defined">${this.rb.getLabel('pageFormatUserDefined')}</option>
            </select>`)
            .change(event => {
                let cmd = new SetValueCmd(this.documentProperties.getId(), 'rbro_document_properties_page_format', 'pageFormat',
                    elPageFormat.val(), SetValueCmd.type.select, this.rb);
                this.rb.executeCommand(cmd);
            });
        elFormField.append(elPageFormat);

        let elPageSizeDiv = $('<div id="rbro_document_properties_page_size_row" class="rbroTripleSplit"></div>');
        let elPageWidth = $('<input id="rbro_document_properties_page_width" maxlength="5">')
            .change(event => {
                let cmd = new SetValueCmd(this.documentProperties.getId(), 'rbro_document_properties_page_width', 'pageWidth',
                    elPageWidth.val(), SetValueCmd.type.select, this.rb);
                this.rb.executeCommand(cmd);
            });
        utils.setInputPositiveInteger(elPageWidth);
        elPageSizeDiv.append(elPageWidth);
        let elPageHeight = $('<input id="rbro_document_properties_page_height" maxlength="5">')
            .change(event => {
                let cmd = new SetValueCmd(this.documentProperties.getId(), 'rbro_document_properties_page_height', 'pageHeight',
                    elPageHeight.val(), SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            });
        utils.setInputPositiveInteger(elPageHeight);
        elPageSizeDiv.append(elPageHeight);
        let elUnit = $(`<select id="rbro_document_properties_unit">
            <option value="mm">mm</option>
            <option value="inch">inch</option>
        </select>`)
        .change(event => {
            let cmd = new SetValueCmd(this.documentProperties.getId(), 'rbro_document_properties_unit', 'unit',
                elUnit.val(), SetValueCmd.type.select, this.rb);
            this.rb.executeCommand(cmd);
        });
        elPageSizeDiv.append(elUnit);
        elFormField.append(elPageSizeDiv);
        elFormField.append('<div id="rbro_document_properties_page_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);
        if (this.documentProperties.getValue('pageFormat') !== DocumentProperties.pageFormat.userDefined) {
            elPageSizeDiv.hide();
        }

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_document_properties_orientation">${this.rb.getLabel('orientation')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elOrientation = $(`<select id="rbro_document_properties_orientation">
                <option value="portrait">${this.rb.getLabel('orientationPortrait')}</option>
                <option value="landscape">${this.rb.getLabel('orientationLandscape')}</option>
            </select>`)
            .change(event => {
                let cmd = new SetValueCmd(this.documentProperties.getId(), 'rbro_document_properties_orientation', 'orientation',
                    elOrientation.val(), SetValueCmd.type.select, this.rb);
                this.rb.executeCommand(cmd);
            });
        elFormField.append(elOrientation);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_document_properties_content_height">${this.rb.getLabel('contentHeight')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elContentHeight = $('<input id="rbro_document_properties_content_height">')
            .change(event => {
                let cmd = new SetValueCmd(this.documentProperties.getId(), 'rbro_document_properties_content_height', 'contentHeight',
                    elContentHeight.val(), SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            });
        utils.setInputPositiveInteger(elContentHeight);
        elFormField.append(elContentHeight);
        elFormField.append(`<div class="rbroInfo">${this.rb.getLabel('contentHeightInfo')}</div>`);
        elDiv.append(elFormField);
        panel.append(elDiv);

        this.renderMarginControls(panel);
        this.renderHeaderFooter(panel);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_document_properties_pattern_locale">${this.rb.getLabel('patternLocale')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elPatternLocale = $(`<select id="rbro_document_properties_pattern_locale">
                <option value="de">de</option>
                <option value="en">en</option>
                <option value="es">es</option>
                <option value="fr">fr</option>
                <option value="it">it</option>
            </select>`)
            .change(event => {
                let cmd = new SetValueCmd(this.documentProperties.getId(), 'rbro_document_properties_pattern_locale', 'patternLocale',
                    elPatternLocale.val(), SetValueCmd.type.select, this.rb);
                this.rb.executeCommand(cmd);
            });
        elFormField.append(elPatternLocale);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_document_properties_pattern_currency_symbol">${this.rb.getLabel('patternCurrencySymbol')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elPatternCurrencySymbol = $('<input id="rbro_document_properties_pattern_currency_symbol">')
            .change(event => {
                let cmd = new SetValueCmd(this.rb.getDetailData().getId(),
                    'rbro_document_properties_pattern_currency_symbol', 'patternCurrencySymbol',
                    elPatternCurrencySymbol.val(), SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            });
        elFormField.append(elPatternCurrencySymbol);
        elDiv.append(elFormField);
        panel.append(elDiv);

        $('#rbro_detail_panel').append(panel);

        this.updateData(this.documentProperties);
    }

    renderMarginControls(panel) {
        let elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_document_properties_page_margin_top">${this.rb.getLabel('pageMargins')}:</label>`);
        let elFormField = $('<div class="rbroFormField rbroSmallInput"></div>');
        
        let elMarginTopDiv = $('<div class="rbroColumnCenter"></div>');
        let elMarginTop = $(`<input id="rbro_document_properties_page_margin_top" placeholder="${this.rb.getLabel('orientationTop')}">`)
            .change(event => {
                let cmd = new SetValueCmd(this.documentProperties.getId(), 'rbro_document_properties_page_margin_top', 'marginTop',
                    elMarginTop.val(), SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            });
        utils.setInputPositiveInteger(elMarginTop);
        elMarginTopDiv.append(elMarginTop);
        elFormField.append(elMarginTopDiv);

        let elDiv2 = $('<div class="rbroSplit"></div>');
        let elMarginLeft = $(`<input id="rbro_document_properties_page_margin_left" placeholder="${this.rb.getLabel('orientationLeft')}">`)
            .change(event => {
                let cmd = new SetValueCmd(this.documentProperties.getId(), 'rbro_document_properties_page_margin_left', 'marginLeft',
                    elMarginLeft.val(), SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            });
        utils.setInputPositiveInteger(elMarginLeft);
        elDiv2.append(elMarginLeft);
        let elMarginRight = $(`<input id="rbro_document_properties_page_margin_right" placeholder="${this.rb.getLabel('orientationRight')}">`)
            .change(event => {
                let cmd = new SetValueCmd(this.documentProperties.getId(), 'rbro_document_properties_page_margin_right', 'marginRight',
                    elMarginRight.val(), SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            });
        utils.setInputPositiveInteger(elMarginRight);
        elDiv2.append(elMarginRight);
        elFormField.append(elDiv2);

        let elMarginBottomDiv = $('<div class="rbroColumnCenter"></div>');
        let elMarginBottom = $(`<input id="rbro_document_properties_page_margin_bottom" placeholder="${this.rb.getLabel('orientationBottom')}">`)
            .change(event => {
                let cmd = new SetValueCmd(this.documentProperties.getId(), 'rbro_document_properties_page_margin_bottom', 'marginBottom',
                    elMarginBottom.val(), SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            });
        utils.setInputPositiveInteger(elMarginBottom);
        elMarginBottomDiv.append(elMarginBottom);
        elFormField.append(elMarginBottomDiv);
        elDiv.append(elFormField);
        panel.append(elDiv);
    }

    renderHeaderFooter(panel) {
        let elHeaderDiv = $('<div class="rbroFormRowContainer"></div>');
        let elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_document_properties_header">${this.rb.getLabel('header')}:</label>`);
        let elFormField = $('<div class="rbroFormField"></div>');
        let elHeaderLabel = $(`<label class="switch-light switch-material"></label>`);
        let elHeader = $(`<input id="rbro_document_properties_header" type="checkbox">`)
            .change(event => {
                let cmd = new SetValueCmd(this.documentProperties.getId(), 'rbro_document_properties_header', 'header',
                    elHeader.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                this.rb.executeCommand(cmd);
            });
        elHeaderLabel.append(elHeader);
        let elHeaderSpan = $('<span></span>');
        elHeaderSpan.append($('<span></span>'));
        elHeaderSpan.append($('<span></span>'));
        elHeaderSpan.append($('<a></a>'));
        elHeaderLabel.append(elHeaderSpan);
        elFormField.append(elHeaderLabel);
        elDiv.append(elFormField);
        elHeaderDiv.append(elDiv);
        let elHeaderSettings = $('<div id="rbro_document_properties_header_settings"></div>');
        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_document_properties_header_size">${this.rb.getLabel('headerSize')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elHeaderSize = $('<input id="rbro_document_properties_header_size">')
            .change(event => {
                let cmd = new SetValueCmd(this.documentProperties.getId(), 'rbro_document_properties_header_size', 'headerSize',
                    elHeaderSize.val(), SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            });
        utils.setInputPositiveInteger(elHeaderSize);
        elFormField.append(elHeaderSize);
        elDiv.append(elFormField);
        elHeaderSettings.append(elDiv);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_document_properties_header_display">${this.rb.getLabel('headerDisplay')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elHeaderDisplay = $(`<select id="rbro_document_properties_header_display">
                <option value="always">${this.rb.getLabel('headerFooterDisplayAlways')}</option>
                <option value="not_on_first_page">${this.rb.getLabel('headerFooterDisplayNotOnFirstPage')}</option>
            </select>`)
            .change(event => {
                let cmd = new SetValueCmd(this.documentProperties.getId(), 'rbro_document_properties_header_display', 'headerDisplay',
                    elHeaderDisplay.val(), SetValueCmd.type.select, this.rb);
                this.rb.executeCommand(cmd);
            });
        elFormField.append(elHeaderDisplay);
        elDiv.append(elFormField);
        elHeaderSettings.append(elDiv);
        elHeaderDiv.append(elHeaderSettings);
        panel.append(elHeaderDiv);

        let elFooterDiv = $('<div class="rbroFormRowContainer"></div>');
        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_document_properties_footer">${this.rb.getLabel('footer')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elFooterLabel = $(`<label class="switch-light switch-material"></label>`);
        let elFooter = $(`<input id="rbro_document_properties_footer" type="checkbox">`)
            .change(event => {
                let cmd = new SetValueCmd(this.documentProperties.getId(), 'rbro_document_properties_footer', 'footer',
                    elFooter.is(":checked"), SetValueCmd.type.checkbox, this.rb);
                this.rb.executeCommand(cmd);
            });
        elFooterLabel.append(elFooter);
        let elFooterSpan = $('<span></span>');
        elFooterSpan.append($('<span></span>'));
        elFooterSpan.append($('<span></span>'));
        elFooterSpan.append($('<a></a>'));
        elFooterLabel.append(elFooterSpan);
        elFormField.append(elFooterLabel);
        elDiv.append(elFormField);
        elFooterDiv.append(elDiv);
        let elFooterSettings = $('<div id="rbro_document_properties_footer_settings"></div>');
        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_document_properties_footer_size">${this.rb.getLabel('footerSize')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elFooterSize = $('<input id="rbro_document_properties_footer_size">')
            .change(event => {
                let cmd = new SetValueCmd(this.documentProperties.getId(), 'rbro_document_properties_footer_size', 'footerSize',
                    elFooterSize.val(), SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            });
        utils.setInputPositiveInteger(elFooterSize);
        elFormField.append(elFooterSize);
        elDiv.append(elFormField);
        elFooterSettings.append(elDiv);

        elDiv = $('<div class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_document_properties_footer_display">${this.rb.getLabel('footerDisplay')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elFooterDisplay = $(`<select id="rbro_document_properties_footer_display">
                <option value="always">${this.rb.getLabel('headerFooterDisplayAlways')}</option>
                <option value="not_on_first_page">${this.rb.getLabel('headerFooterDisplayNotOnFirstPage')}</option>
            </select>`)
            .change(event => {
                let cmd = new SetValueCmd(this.documentProperties.getId(), 'rbro_document_properties_footer_display', 'footerDisplay',
                    elFooterDisplay.val(), SetValueCmd.type.select, this.rb);
                this.rb.executeCommand(cmd);
            });
        elFormField.append(elFooterDisplay);
        elDiv.append(elFormField);
        elFooterSettings.append(elDiv);
        elFooterDiv.append(elFooterSettings);
        panel.append(elFooterDiv);
    }

    show(data) {
        $('#rbro_document_properties_panel').removeClass('rbroHidden');
        this.updateData(data);
    }

    hide() {
        $('#rbro_document_properties_panel').addClass('rbroHidden');
    }

    /**
     * Is called when the selected element was changed.
     * The panel is updated to show the values of the selected data object.
     * @param {DocumentProperties} data
     */
    updateData(data) {
        if (data !== null) {
            $('#rbro_document_properties_page_format').val(data.getValue('pageFormat'));
            $('#rbro_document_properties_page_width').val(data.getValue('pageWidth'));
            $('#rbro_document_properties_page_height').val(data.getValue('pageHeight'));
            $('#rbro_document_properties_unit').val(data.getValue('unit'));
            $('#rbro_document_properties_orientation').val(data.getValue('orientation'));
            $('#rbro_document_properties_content_height').val(data.getValue('contentHeight'));
            $('#rbro_document_properties_page_margin_top').val(data.getValue('marginTop'));
            $('#rbro_document_properties_page_margin_left').val(data.getValue('marginLeft'));
            $('#rbro_document_properties_page_margin_right').val(data.getValue('marginRight'));
            $('#rbro_document_properties_page_margin_bottom').val(data.getValue('marginBottom'));
            $('#rbro_document_properties_header').prop('checked', data.getValue('header'));
            $('#rbro_document_properties_header_size').val(data.getValue('headerSize'));
            $('#rbro_document_properties_header_display').val(data.getValue('headerDisplay'));
            $('#rbro_document_properties_footer').prop('checked', data.getValue('footer'));
            $('#rbro_document_properties_footer_size').val(data.getValue('footerSize'));
            $('#rbro_document_properties_footer_display').val(data.getValue('footerDisplay'));
            $('#rbro_document_properties_pattern_locale').val(data.getValue('patternLocale'));
            $('#rbro_document_properties_pattern_currency_symbol').val(data.getValue('patternCurrencySymbol'));
            this.updateVisibility(data);
        }
        this.updateErrors();
    }

    /**
     * Is called when a data object was modified (including new and deleted data objects).
     * @param {*} obj - new/deleted/modified data object.
     * @param {String} operation - operation which caused the notification.
     */
    notifyEvent(obj, operation) {
        if (obj instanceof DocumentProperties && obj === this.rb.getDetailData() && operation === Command.operation.change) {
            this.updateVisibility(obj);
        }
    }

    updateVisibility(obj) {
        if (obj.getValue('pageFormat') === DocumentProperties.pageFormat.userDefined) {
            $('#rbro_document_properties_page_size_row').show();
        } else {
            $('#rbro_document_properties_page_size_row').hide();
        }
        if (obj.getValue('header')) {
            $('#rbro_document_properties_header_settings').show();
        } else {
            $('#rbro_document_properties_header_settings').hide();
        }
        if (obj.getValue('footer')) {
            $('#rbro_document_properties_footer_settings').show();
        } else {
            $('#rbro_document_properties_footer_settings').hide();
        }
    }

    /**
     * Updates displayed errors of currently selected data object.
     */
    updateErrors() {
        $('#rbro_document_properties_panel .rbroFormRow').removeClass('rbroError');
        $('#rbro_document_properties_panel .rbroErrorMessage').text('');
        for (let error of this.documentProperties.getErrors()) {
            let rowId = 'rbro_document_properties_' + error.field + '_row';
            let errorId = 'rbro_document_properties_' + error.field + '_error';
            let errorMsg = this.rb.getLabel(error.msg_key);
            if (error.info) {
                errorMsg = errorMsg.replace('${info}', '<span class="rbroErrorMessageInfo">' + error.info + '</span>');
            }
            $('#' + rowId).addClass('rbroError');
            $('#' + errorId).html(errorMsg);
        }
    }
}
