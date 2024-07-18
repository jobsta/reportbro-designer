import PanelBase from './PanelBase';
import SetValueCmd from '../commands/SetValueCmd';
import DocumentProperties from '../data/DocumentProperties';
import * as utils from '../utils';

/**
 * Panel to edit all document properties.
 * @class
 */
export default class DocumentPropertiesPanel extends PanelBase {
    constructor(rootElement, rb) {
        super('rbro_document_properties', DocumentProperties, rootElement, rb);

        this.propertyDescriptors = {
            'pageFormat': {
                'type': SetValueCmd.type.text,
                'fieldId': 'page_format',
                'rowId': 'rbro_document_properties_page_row',
                'errorMsgId': 'rbro_document_properties_page_error'
            },
            'pageWidth': {
                'type': SetValueCmd.type.text,
                'fieldId': 'page_width',
                'rowId': 'rbro_document_properties_page_size_row',
                'errorMsgId': 'rbro_document_properties_page_error',
                'visibleIf': "pageFormat == 'user_defined'",
            },
            'pageHeight': {
                'type': SetValueCmd.type.text,
                'fieldId': 'page_height',
                'rowId': 'rbro_document_properties_page_size_row',
                'errorMsgId': 'rbro_document_properties_page_error',
                'visibleIf': "pageFormat == 'user_defined'",
            },
            'unit': {
                'type': SetValueCmd.type.select,
                'fieldId': 'unit',
                'rowId': 'rbro_document_properties_page_size_row',
                'errorMsgId': 'rbro_document_properties_page_error',
                'visibleIf': "pageFormat == 'user_defined'",
            },
            'orientation': {
                'type': SetValueCmd.type.select,
                'fieldId': 'orientation'
            },
            'contentHeight': {
                'type': SetValueCmd.type.text,
                'fieldId': 'content_height'
            },
            'marginLeft': {
                'type': SetValueCmd.type.text,
                'fieldId': 'page_margin_left',
                'rowId': 'rbro_document_properties_page_margin_row',
            },
            'marginTop': {
                'type': SetValueCmd.type.text,
                'fieldId': 'page_margin_top',
                'rowId': 'rbro_document_properties_page_margin_row',
            },
            'marginRight': {
                'type': SetValueCmd.type.text,
                'fieldId': 'page_margin_right',
                'rowId': 'rbro_document_properties_page_margin_row',
            },
            'marginBottom': {
                'type': SetValueCmd.type.text,
                'fieldId': 'page_margin_bottom',
                'rowId': 'rbro_document_properties_page_margin_row',
            },
            'header': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'header'
            },
            'headerSize': {
                'type': SetValueCmd.type.text,
                'fieldId': 'header_size',
                'visibleIf': 'header',
            },
            'headerDisplay': {
                'type': SetValueCmd.type.select,
                'fieldId': 'header_display',
                'visibleIf': 'header',
            },
            'footer': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'footer'
            },
            'footerSize': {
                'type': SetValueCmd.type.text,
                'fieldId': 'footer_size',
                'visibleIf': 'footer',
            },
            'footerDisplay': {
                'type': SetValueCmd.type.select,
                'fieldId': 'footer_display',
                'visibleIf': 'footer',
            },
            'watermark': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'watermark'
            },
            'patternLocale': {
                'type': SetValueCmd.type.select,
                'fieldId': 'pattern_locale'
            },
            'patternCurrencySymbol': {
                'type': SetValueCmd.type.text,
                'fieldId': 'pattern_currency_symbol'
            },
            'patternNumberGroupSymbol': {
                'type': SetValueCmd.type.text,
                'fieldId': 'pattern_number_group_symbol'
            },
        };

        super.initVisibleIfFields();
    }

    render(data) {
        let panel = utils.createElement('div', { id: 'rbro_document_properties_panel', class: 'rbroHidden' });
        let elDiv = utils.createElement('div', { id: 'rbro_document_properties_page_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('pageFormat'), 'rbro_document_properties_page_format');
        let elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elPageFormat = utils.createElement('select', { id: 'rbro_document_properties_page_format' });
        elPageFormat.append(utils.createElement('option', { value: 'A4' }, this.rb.getLabel('pageFormatA4')));
        elPageFormat.append(utils.createElement('option', { value: 'A5' }, this.rb.getLabel('pageFormatA5')));
        elPageFormat.append(utils.createElement('option', { value: 'letter' }, this.rb.getLabel('pageFormatLetter')));
        elPageFormat.append(
            utils.createElement('option', { value: 'user_defined' }, this.rb.getLabel('pageFormatUserDefined')));
        elPageFormat.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'pageFormat', elPageFormat.value,
                    SetValueCmd.type.select, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        elFormField.append(elPageFormat);

        let elPageSizeDiv = utils.createElement(
            'div', { id: 'rbro_document_properties_page_size_row', class: 'rbroTripleSplit' });
        let elPageWidth = utils.createElement(
            'input', { id: 'rbro_document_properties_page_width', maxlength: '5', type: 'number',
                autocomplete: 'off'
            });
        elPageWidth.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'pageWidth', elPageWidth.value,
                    SetValueCmd.type.select, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        utils.setInputPositiveInteger(elPageWidth);
        elPageSizeDiv.append(elPageWidth);
        let elPageHeight = utils.createElement(
            'input', { id: 'rbro_document_properties_page_height', maxlength: '5', type: 'number',
                autocomplete: 'off'
            });
        elPageHeight.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'pageHeight', elPageHeight.value,
                    SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        utils.setInputPositiveInteger(elPageHeight);
        elPageSizeDiv.append(elPageHeight);
        let elUnit = utils.createElement('select', { id: 'rbro_document_properties_unit' });
        elUnit.append(utils.createElement('option', { value: 'mm' }, 'mm'));
        elUnit.append(utils.createElement('option', { value: 'inch' }, 'inch'));
        elPageSizeDiv.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'unit', elUnit.value, SetValueCmd.type.select, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        elPageSizeDiv.append(elUnit);
        elFormField.append(elPageSizeDiv);
        elFormField.append(
            utils.createElement('div', { id: 'rbro_document_properties_page_error', class: 'rbroErrorMessage' }));
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_document_properties_orientation_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('orientation'), 'rbro_document_properties_orientation');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elOrientation = utils.createElement('select', { id: 'rbro_document_properties_orientation' });
        elOrientation.append(
            utils.createElement('option', { value: 'portrait' }, this.rb.getLabel('orientationPortrait')));
        elOrientation.append(
            utils.createElement('option', { value: 'landscape' }, this.rb.getLabel('orientationLandscape')));
        elOrientation.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'orientation', elOrientation.value,
                    SetValueCmd.type.select, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        elFormField.append(elOrientation);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_document_properties_content_height_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('contentHeight'), 'rbro_document_properties_content_height');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elContentHeight = utils.createElement('input', {
            id: 'rbro_document_properties_content_height', type: 'number', autocomplete: 'off'
        });
        elContentHeight.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'contentHeight', elContentHeight.value,
                    SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        utils.setInputPositiveInteger(elContentHeight);
        elFormField.append(elContentHeight);
        elFormField.append(utils.createElement('div', { class: 'rbroInfo' }, this.rb.getLabel('contentHeightInfo')));
        elDiv.append(elFormField);
        panel.append(elDiv);

        this.renderMarginControls(panel);
        this.renderHeaderFooter(panel);

        if (this.rb.getProperty('showPlusFeatures')) {
            elDiv = utils.createElement('div', { id: 'rbro_document_properties_watermark_row', class: 'rbroFormRow' });
            utils.appendLabel(elDiv, this.rb.getLabel('watermarks'), 'rbro_document_properties_watermark');
            elFormField = utils.createElement('div', { class: 'rbroFormField' });
            let elWatermarkLabel = utils.createElement('label', { class: 'switch-light switch-material' });
            let elWatermark = utils.createElement(
                'input', { id: 'rbro_document_properties_watermark', type: 'checkbox' });
            elWatermark.addEventListener('change', (event) => {
                let watermarkChecked = elWatermark.checked;
                let selectedObject = this.rb.getSelectedObject();
                if (selectedObject !== null) {
                    let cmd = new SetValueCmd(
                        selectedObject.getId(), 'watermark', watermarkChecked, SetValueCmd.type.checkbox, this.rb)
                    this.rb.executeCommand(cmd);
                }
            });
            elWatermarkLabel.append(elWatermark);
            let elWatermarkSpan = utils.createElement('span');
            elWatermarkSpan.append(utils.createElement('span'));
            elWatermarkSpan.append(utils.createElement('span'));
            elWatermarkSpan.append(utils.createElement('a'));
            elWatermarkLabel.append(elWatermarkSpan);
            elFormField.append(elWatermarkLabel);
            elFormField.append(
                utils.createElement(
                    'div', { id: 'rbro_document_properties_watermark_error', class: 'rbroErrorMessage' })
            );
            if (this.rb.getProperty('showPlusFeaturesInfo')) {
                const elInfoText = utils.createElement('div', { class: 'rbroInfo' });
                elInfoText.innerHTML = this.rb.getLabel('plusFeatureInfo');
                elFormField.append(elInfoText);
            }
            elDiv.append(elFormField);
            panel.append(elDiv);
        }

        elDiv = utils.createElement('div', { id: 'rbro_document_properties_pattern_locale_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('patternLocale'), 'rbro_document_properties_pattern_locale');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elPatternLocale = utils.createElement('select', { id: 'rbro_document_properties_pattern_locale' });
        elPatternLocale.append(utils.createElement('option', { value: 'de' }, 'de'));
        elPatternLocale.append(utils.createElement('option', { value: 'en' }, 'en'));
        elPatternLocale.append(utils.createElement('option', { value: 'es' }, 'es'));
        elPatternLocale.append(utils.createElement('option', { value: 'fr' }, 'fr'));
        elPatternLocale.append(utils.createElement('option', { value: 'it' }, 'it'));
        elPatternLocale.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'patternLocale', elPatternLocale.value,
                    SetValueCmd.type.select, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        elFormField.append(elPatternLocale);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement(
          'div', { id: 'rbro_document_properties_pattern_currency_symbol_row', class: 'rbroFormRow' });
        utils.appendLabel(
            elDiv, this.rb.getLabel('patternCurrencySymbol'), 'rbro_document_properties_pattern_currency_symbol');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elPatternCurrencySymbol = utils.createElement(
            'input', { id: 'rbro_document_properties_pattern_currency_symbol', autocomplete: 'off' });
        elPatternCurrencySymbol.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'patternCurrencySymbol',
                    elPatternCurrencySymbol.value, SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        elFormField.append(elPatternCurrencySymbol);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement(
          'div', { id: 'rbro_document_properties_pattern_number_group_symbol_row', class: 'rbroFormRow' });
        utils.appendLabel(
            elDiv, this.rb.getLabel('patternNumberGroupSymbol'),
            'rbro_document_properties_pattern_number_group_symbol');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elPatternNumberGroupSymbol = utils.createElement('input', {
            id: 'rbro_document_properties_pattern_number_group_symbol', maxlength: '1', autocomplete: 'off'
        });
        elPatternNumberGroupSymbol.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'patternNumberGroupSymbol',
                    elPatternNumberGroupSymbol.value, SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        elFormField.append(elPatternNumberGroupSymbol);
        elFormField.append(utils.createElement(
            'div', { class: 'rbroInfo' }, this.rb.getLabel('patternNumberGroupSymbolInfo')));
        elDiv.append(elFormField);
        panel.append(elDiv);

        document.getElementById('rbro_detail_panel').append(panel);
    }

    renderMarginControls(panel) {
        let elDiv = utils.createElement(
          'div', { id: 'rbro_document_properties_page_margin_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('pageMargins'), 'rbro_document_properties_page_margin_top');
        let elFormField = utils.createElement('div', { class: 'rbroFormField rbroSmallInput' });

        let elMarginTopDiv = utils.createElement('div', { class: 'rbroColumnCenter' });
        let elMarginTop = utils.createElement(
            'input', {
                id: 'rbro_document_properties_page_margin_top', placeholder: this.rb.getLabel('orientationTop'),
                type: 'number', autocomplete: 'off'
            });
        elMarginTop.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'marginTop', elMarginTop.value,
                    SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        utils.setInputPositiveInteger(elMarginTop);
        elMarginTopDiv.append(elMarginTop);
        elFormField.append(elMarginTopDiv);

        let elDiv2 = utils.createElement('div', { class: 'rbroSplit' });
        let elMarginLeft = utils.createElement(
            'input', {
                id: 'rbro_document_properties_page_margin_left', placeholder: this.rb.getLabel('orientationLeft'),
                type: 'number', autocomplete: 'off'
            });
        elMarginLeft.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'marginLeft', elMarginLeft.value,
                    SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        utils.setInputPositiveInteger(elMarginLeft);
        elDiv2.append(elMarginLeft);
        let elMarginRight = utils.createElement(
            'input', {
                id: 'rbro_document_properties_page_margin_right', placeholder: this.rb.getLabel('orientationRight'),
                type: 'number', autocomplete: 'off'
            });
        elMarginRight.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'marginRight', elMarginRight.value,
                    SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        utils.setInputPositiveInteger(elMarginRight);
        elDiv2.append(elMarginRight);
        elFormField.append(elDiv2);

        let elMarginBottomDiv = utils.createElement('div', { class: 'rbroColumnCenter' });
        let elMarginBottom = utils.createElement(
            'input', {
                id: 'rbro_document_properties_page_margin_bottom', placeholder: this.rb.getLabel('orientationBottom'),
                type: 'number', autocomplete: 'off'
            });
        elMarginBottom.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'marginBottom', elMarginBottom.value,
                    SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        utils.setInputPositiveInteger(elMarginBottom);
        elMarginBottomDiv.append(elMarginBottom);
        elFormField.append(elMarginBottomDiv);
        elDiv.append(elFormField);
        panel.append(elDiv);
    }

    renderHeaderFooter(panel) {
        let elHeaderDiv = utils.createElement('div', { class: 'rbroFormRowContainer' });
        let elDiv = utils.createElement('div', { id: 'rbro_document_properties_header_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('header'), 'rbro_document_properties_header');
        let elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elHeaderLabel = utils.createElement('label', { class: 'switch-light switch-material' });
        let elHeader = utils.createElement('input', { id: 'rbro_document_properties_header', type: 'checkbox' });
        elHeader.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'header', elHeader.checked,
                    SetValueCmd.type.checkbox, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        elHeaderLabel.append(elHeader);
        let elHeaderSpan = utils.createElement('span');
        elHeaderSpan.append(utils.createElement('span'));
        elHeaderSpan.append(utils.createElement('span'));
        elHeaderSpan.append(utils.createElement('a'));
        elHeaderLabel.append(elHeaderSpan);
        elFormField.append(elHeaderLabel);
        elDiv.append(elFormField);
        elHeaderDiv.append(elDiv);
        let elHeaderSettings = utils.createElement('div', { id: 'rbro_document_properties_header_settings' });
        elDiv = utils.createElement('div', { id: 'rbro_document_properties_header_size_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('headerSize'), 'rbro_document_properties_header_size');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elHeaderSize = utils.createElement('input', { id: 'rbro_document_properties_header_size',
            type: 'number', autocomplete: 'off'  });
        elHeaderSize.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'headerSize', elHeaderSize.value,
                    SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        utils.setInputPositiveInteger(elHeaderSize);
        elFormField.append(elHeaderSize);
        elDiv.append(elFormField);
        elHeaderSettings.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_document_properties_header_display_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('headerDisplay'), 'rbro_document_properties_header_display');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elHeaderDisplay = utils.createElement('select', { id: 'rbro_document_properties_header_display' });
        elHeaderDisplay.append(
            utils.createElement('option', { value: 'always' }, this.rb.getLabel('headerFooterDisplayAlways')));
        elHeaderDisplay.append(
            utils.createElement(
                'option', { value: 'not_on_first_page' }, this.rb.getLabel('headerFooterDisplayNotOnFirstPage')));
        elHeaderDisplay.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'headerDisplay', elHeaderDisplay.value,
                    SetValueCmd.type.select, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        elFormField.append(elHeaderDisplay);
        elDiv.append(elFormField);
        elHeaderSettings.append(elDiv);
        elHeaderDiv.append(elHeaderSettings);
        panel.append(elHeaderDiv);

        let elFooterDiv = utils.createElement('div', { class: 'rbroFormRowContainer' });
        elDiv = utils.createElement('div', { id: 'rbro_document_properties_footer_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('footer'), 'rbro_document_properties_footer');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elFooterLabel = utils.createElement('label', { class: 'switch-light switch-material' });
        let elFooter = utils.createElement('input', { id: 'rbro_document_properties_footer', type: 'checkbox' });
        elFooter.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'footer', elFooter.checked,
                    SetValueCmd.type.checkbox, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        elFooterLabel.append(elFooter);
        let elFooterSpan = utils.createElement('span');
        elFooterSpan.append(utils.createElement('span'));
        elFooterSpan.append(utils.createElement('span'));
        elFooterSpan.append(utils.createElement('a'));
        elFooterLabel.append(elFooterSpan);
        elFormField.append(elFooterLabel);
        elDiv.append(elFormField);
        elFooterDiv.append(elDiv);
        let elFooterSettings = utils.createElement('div', { id: 'rbro_document_properties_footer_settings' });
        elDiv = utils.createElement('div', { id: 'rbro_document_properties_footer_size_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('footerSize'), 'rbro_document_properties_footer_size');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elFooterSize = utils.createElement('input', { id: 'rbro_document_properties_footer_size',
            type: 'number', autocomplete: 'off' });
        elFooterSize.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'footerSize', elFooterSize.value,
                    SetValueCmd.type.text, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        utils.setInputPositiveInteger(elFooterSize);
        elFormField.append(elFooterSize);
        elDiv.append(elFormField);
        elFooterSettings.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_document_properties_footer_display_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('footerDisplay'), 'rbro_document_properties_footer_display');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elFooterDisplay = utils.createElement('select', { id: 'rbro_document_properties_footer_display' });
        elFooterDisplay.append(
            utils.createElement('option', { value: 'always' }, this.rb.getLabel('headerFooterDisplayAlways')));
        elFooterDisplay.append(
            utils.createElement(
                'option', { value: 'not_on_first_page' }, this.rb.getLabel('headerFooterDisplayNotOnFirstPage')));
        elFooterDisplay.addEventListener('change', (event) => {
            let selectedObject = this.rb.getSelectedObject();
            if (selectedObject !== null) {
                let cmd = new SetValueCmd(
                    selectedObject.getId(), 'footerDisplay', elFooterDisplay.value,
                    SetValueCmd.type.select, this.rb);
                this.rb.executeCommand(cmd);
            }
        });
        elFormField.append(elFooterDisplay);
        elDiv.append(elFormField);
        elFooterSettings.append(elDiv);
        elFooterDiv.append(elFooterSettings);
        panel.append(elFooterDiv);
    }
}
