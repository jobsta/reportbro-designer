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
                'rowId': 'rbro_document_properties_page_row',
                'errorMsgId': 'rbro_document_properties_page_error'
            },
            'pageHeight': {
                'type': SetValueCmd.type.text,
                'fieldId': 'page_height',
                'rowId': 'rbro_document_properties_page_row',
                'errorMsgId': 'rbro_document_properties_page_error'
            },
            'unit': {
                'type': SetValueCmd.type.select,
                'fieldId': 'unit',
                'rowId': 'rbro_document_properties_page_row',
                'errorMsgId': 'rbro_document_properties_page_error'
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
                'fieldId': 'page_margin_left'
            },
            'marginTop': {
                'type': SetValueCmd.type.text,
                'fieldId': 'page_margin_top'
            },
            'marginRight': {
                'type': SetValueCmd.type.text,
                'fieldId': 'page_margin_right'
            },
            'marginBottom': {
                'type': SetValueCmd.type.text,
                'fieldId': 'page_margin_bottom'
            },
            'header': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'header'
            },
            'headerSize': {
                'type': SetValueCmd.type.text,
                'fieldId': 'header_size'
            },
            'headerDisplay': {
                'type': SetValueCmd.type.select,
                'fieldId': 'header_display'
            },
            'footer': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'footer'
            },
            'footerSize': {
                'type': SetValueCmd.type.text,
                'fieldId': 'footer_size'
            },
            'footerDisplay': {
                'type': SetValueCmd.type.select,
                'fieldId': 'footer_display'
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

        elDiv = utils.createElement('div', { class: 'rbroFormRow' });
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

        elDiv = utils.createElement('div', { class: 'rbroFormRow' });
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

        elDiv = utils.createElement('div', { class: 'rbroFormRow' });
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

        elDiv = utils.createElement('div', { class: 'rbroFormRow' });
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

        elDiv = utils.createElement('div', { class: 'rbroFormRow' });
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
        let elDiv = utils.createElement('div', { class: 'rbroFormRow' });
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
        let elDiv = utils.createElement('div', { class: 'rbroFormRow' });
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
        elDiv = utils.createElement('div', { class: 'rbroFormRow' });
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

        elDiv = utils.createElement('div', { class: 'rbroFormRow' });
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
        elDiv = utils.createElement('div', { class: 'rbroFormRow' });
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
        elDiv = utils.createElement('div', { class: 'rbroFormRow' });
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

        elDiv = utils.createElement('div', { class: 'rbroFormRow' });
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

    /**
     * Is called when the selected element was changed.
     * The panel is updated to show the values of the selected data object.
     * @param {DocumentProperties} obj - currently selected object.
     * @param {String} [field] - affected field in case of change operation.
     */
    static updateVisibileRows(obj, field) {
        if (field === null || field === 'pageFormat') {
            if (obj.getValue('pageFormat') === DocumentProperties.pageFormat.userDefined) {
                document.getElementById('rbro_document_properties_page_size_row').style.display = 'flex';
            } else {
                document.getElementById('rbro_document_properties_page_size_row').style.display = 'none';
            }
        }
        if (field === null || field === 'header') {
            if (obj.getValue('header')) {
                document.getElementById('rbro_document_properties_header_settings').style.display = 'block';
            } else {
                document.getElementById('rbro_document_properties_header_settings').style.display = 'none';
            }
        }
        if (field === null || field === 'footer') {
            if (obj.getValue('footer')) {
                document.getElementById('rbro_document_properties_footer_settings').style.display = 'block';
            } else {
                document.getElementById('rbro_document_properties_footer_settings').style.display = 'none';
            }
        }
    }

    /**
     * Is called when the selection is changed or the selected element was changed.
     * The panel is updated to show the values of the selected data object.
     * @param {String} [field] - affected field in case of change operation.
     */
    updateDisplay(field) {
        let selectedObject = this.rb.getSelectedObject();

        if (selectedObject !== null && selectedObject instanceof DocumentProperties) {
            for (let property in this.propertyDescriptors) {
                if (this.propertyDescriptors.hasOwnProperty(property) && (field === null || property === field)) {
                    let propertyDescriptor = this.propertyDescriptors[property];
                    let value = selectedObject.getValue(property);
                    super.setValue(propertyDescriptor, value, false);
                }
            }

            DocumentPropertiesPanel.updateVisibileRows(selectedObject, field);
        }
    }
}
