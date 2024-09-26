import PanelBase from './PanelBase';
import StylePanel from './StylePanel';
import Command from '../commands/Command';
import CommandGroupCmd from '../commands/CommandGroupCmd';
import SetValueCmd from '../commands/SetValueCmd';
import Parameter from '../data/Parameter';
import Style from '../data/Style';
import DocElement from '../elements/DocElement';
import FrameElement from '../elements/FrameElement';
import ImageElement from '../elements/ImageElement';
import LineElement from '../elements/LineElement';
import SectionBandElement from '../elements/SectionBandElement';
import TableElement from '../elements/TableElement';
import TableBandElement from '../elements/TableBandElement';
import TableTextElement from '../elements/TableTextElement';
import TextElement from '../elements/TextElement';
import PopupWindow from '../PopupWindow';
import * as utils from '../utils';
import Quill from 'quill';
import autosize from 'autosize';

/**
 * Generic panel to edit all shared properties of selected document elements.
 * @class
 */
export default class DocElementPanel extends PanelBase {
    constructor(rootElement, rb) {
        super('rbro_doc_element', DocElement, rootElement, rb);

        this.propertyDescriptors = {
            'label': {
                'type': SetValueCmd.type.text,
                'fieldId': 'label'
            },
            'content': {
                'type': SetValueCmd.type.text,
                'fieldId': 'content',
                'visibleIf': '!richText'
            },
            'richText': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'rich_text',
            },
            'richTextContent': {
                'type': SetValueCmd.type.richText,
                'fieldId': 'rich_text_content',
                'visibleIf': 'richText'
            },
            'eval': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'eval',
                'visibleIf': '!richText'
            },
            'dataSource': {
                'type': SetValueCmd.type.text,
                'fieldId': 'data_source'
            },
            'xReadOnly': {
                'type': SetValueCmd.type.text,
                'fieldId': 'x_read_only'
            },
            'x': {
                'type': SetValueCmd.type.text,
                'fieldId': 'x',
                'rowId': 'rbro_doc_element_position_row',
                'errorMsgId': 'rbro_doc_element_position_error',
                'singleRowProperty': false,
                'rowProperties': ['x', 'y'],
                'labelId': 'rbro_doc_element_position_label',
                'defaultLabel': 'docElementPosition',
                'singlePropertyLabel': 'docElementPositionX'
            },
            'y': {
                'type': SetValueCmd.type.text,
                'fieldId': 'y',
                'rowId': 'rbro_doc_element_position_row',
                'errorMsgId': 'rbro_doc_element_position_error',
                'singleRowProperty': false,
                'labelId': 'rbro_doc_element_position_label',
                'defaultLabel': 'docElementPosition',
                'singlePropertyLabel': 'docElementPositionY'
            },
            'width': {
                'type': SetValueCmd.type.text,
                'fieldId': 'width',
                'rowId': 'rbro_doc_element_size_row',
                'errorMsgId': 'rbro_doc_element_size_error',
                'singleRowProperty': false,
                'rowProperties': ['width', 'height'],
                'labelId': 'rbro_doc_element_size_label',
                'defaultLabel': 'docElementSize',
                'singlePropertyLabel': 'docElementWidth',
                'visibleIf': "docElementType != 'bar_code' || (format != 'QRCode' && rotate)"
            },
            'height': {
                'type': SetValueCmd.type.text,
                'fieldId': 'height',
                'rowId': 'rbro_doc_element_size_row',
                'errorMsgId': 'rbro_doc_element_size_error',
                'singleRowProperty': false,
                'labelId': 'rbro_doc_element_size_label',
                'defaultLabel': 'docElementSize',
                'singlePropertyLabel': 'docElementHeight'
            },
            'colspan': {
                'type': SetValueCmd.type.text,
                'fieldId': 'colspan'
            },
            'format': {
                'type': SetValueCmd.type.select,
                'fieldId': 'format',
                'allowEmpty': false
            },
            'displayValue': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'display_value',
                'visibleIf': "format != 'QRCode'"
            },
            'barWidth': {
                'type': SetValueCmd.type.text,
                'fieldId': 'bar_width',
                'visibleIf': "format != 'QRCode'"
            },
            'guardBar': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'guard_bar',
                'visibleIf': "format == 'EAN8' || format == 'EAN13'"
            },
            'rotate': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'rotate',
                'section': 'print',
                'visibleIf': "format != 'QRCode'"
            },
            'errorCorrectionLevel': {
                'type': SetValueCmd.type.select,
                'fieldId': 'error_correction_level',
                'visibleIf': "format == 'QRCode'"
            },
            'source': {
                'type': SetValueCmd.type.text,
                'fieldId': 'source',
            },
            'image': {
                'type': SetValueCmd.type.file,
                'fieldId': 'image',
                'rowId': 'rbro_doc_element_image_row',
                'singleRowProperty': false,
                'rowProperties': ['image', 'imageFilename'],
            },
            'imageFilename': {
                'type': SetValueCmd.type.filename,
                'fieldId': 'image_filename',
                'rowId': 'rbro_doc_element_image_row',
                'singleRowProperty': false,
            },
            'columns': {
                'type': SetValueCmd.type.text,
                'fieldId': 'columns'
            },
            'header': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'header',
            },
            'contentRows': {
                'type': SetValueCmd.type.text,
                'fieldId': 'content_rows'
            },
            'footer': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'footer'
            },
            'rotateDeg': {
                'type': SetValueCmd.type.text,
                'fieldId': 'rotate_deg',
            },
            'opacity': {
                'type': SetValueCmd.type.text,
                'fieldId': 'opacity',
            },
            'showInForeground': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'show_in_foreground',
            },
            'styleId': {
                'type': SetValueCmd.type.select,
                'fieldId': 'style_id',
                'section': 'style',
                'allowEmpty': true
            },
            'color': {
                'type': SetValueCmd.type.color,
                'allowEmpty': false,
                'fieldId': 'color',
                'section': 'style'
            },
            'bold': {
                'type': SetValueCmd.type.button,
                'fieldId': 'bold',
                'rowId': 'rbro_doc_element_textstyle_row',
                'singleRowProperty': false,
                'rowProperties': ['bold', 'italic', 'underline', 'strikethrough'],
                'section': 'style',
                'visibleIf': '!richText'
            },
            'italic': {
                'type': SetValueCmd.type.button,
                'fieldId': 'italic',
                'rowId': 'rbro_doc_element_textstyle_row',
                'singleRowProperty': false,
                'section': 'style',
                'visibleIf': '!richText'
            },
            'underline': {
                'type': SetValueCmd.type.button,
                'fieldId': 'underline',
                'rowId': 'rbro_doc_element_textstyle_row',
                'singleRowProperty': false,
                'section': 'style',
                'visibleIf': '!richText'
            },
            'strikethrough': {
                'type': SetValueCmd.type.button,
                'fieldId': 'strikethrough',
                'rowId': 'rbro_doc_element_textstyle_row',
                'singleRowProperty': false,
                'section': 'style',
                'visibleIf': '!richText'
            },
            'horizontalAlignment': {
                'type': SetValueCmd.type.buttonGroup,
                'fieldId': 'halignment',
                'rowId': 'rbro_doc_element_alignment_row',
                'singleRowProperty': false,
                'rowProperties': ['horizontalAlignment', 'verticalAlignment'],
                'section': 'style',
                'visibleIf': '!richText'
            },
            'verticalAlignment': {
                'type': SetValueCmd.type.buttonGroup,
                'fieldId': 'valignment',
                'rowId': 'rbro_doc_element_alignment_row',
                'singleRowProperty': false,
                'section': 'style'
            },
            'textColor': {
                'type': SetValueCmd.type.color,
                'allowEmpty': false,
                'fieldId': 'text_color',
                'section': 'style',
                'visibleIf': '!richText'
            },
            'backgroundColor': {
                'type': SetValueCmd.type.color,
                'allowEmpty': true,
                'fieldId': 'background_color',
                'section': 'style'
            },
            'alternateBackgroundColor': {
                'type': SetValueCmd.type.color,
                'allowEmpty': true,
                'fieldId': 'alternate_background_color',
                'section': 'style'
            },
            'font': {
                'type': SetValueCmd.type.select,
                'fieldId': 'font',
                'rowId': 'rbro_doc_element_font_row',
                'singleRowProperty': false,
                'rowProperties': ['font', 'fontSize'],
                'section': 'style',
                'allowEmpty': false,
                'visibleIf': '!richText'
            },
            'fontSize': {
                'type': SetValueCmd.type.select,
                'fieldId': 'font_size',
                'rowId': 'rbro_doc_element_font_row',
                'singleRowProperty': false,
                'section': 'style',
                'allowEmpty': false,
                'visibleIf': '!richText'
            },
            'lineSpacing': {
                'type': SetValueCmd.type.select,
                'fieldId': 'line_spacing',
                'section': 'style',
                'allowEmpty': false
            },
            'borderAll': {
                'type': SetValueCmd.type.button,
                'fieldId': 'border_all',
                'rowId': 'rbro_doc_element_border_row',
                'singleRowProperty': false,
                'rowProperties': ['borderAll', 'borderLeft', 'borderTop', 'borderRight', 'borderBottom'],
                'section': 'style'
            },
            'borderLeft': {
                'type': SetValueCmd.type.button,
                'fieldId': 'border_left',
                'rowId': 'rbro_doc_element_border_row',
                'singleRowProperty': false,
                'section': 'style'
            },
            'borderTop': {
                'type': SetValueCmd.type.button,
                'fieldId': 'border_top',
                'rowId': 'rbro_doc_element_border_row',
                'singleRowProperty': false,
                'section': 'style'
            },
            'borderRight': {
                'type': SetValueCmd.type.button,
                'fieldId': 'border_right',
                'rowId': 'rbro_doc_element_border_row',
                'singleRowProperty': false,
                'section': 'style'
            },
            'borderBottom': {
                'type': SetValueCmd.type.button,
                'fieldId': 'border_bottom',
                'rowId': 'rbro_doc_element_border_row',
                'singleRowProperty': false,
                'section': 'style'
            },
            'border': {
                'type': SetValueCmd.type.buttonGroup,
                'fieldId': 'table_border',
                'rowId': 'rbro_doc_element_table_border_row',
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
                'singleRowProperty': false,
                'rowProperties': ['paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom'],
                'section': 'style'
            },
            'paddingTop': {
                'type': SetValueCmd.type.text,
                'fieldId': 'padding_top',
                'rowId': 'rbro_doc_element_padding_row',
                'singleRowProperty': false,
                'section': 'style'
            },
            'paddingRight': {
                'type': SetValueCmd.type.text,
                'fieldId': 'padding_right',
                'rowId': 'rbro_doc_element_padding_row',
                'singleRowProperty': false,
                'section': 'style'
            },
            'paddingBottom': {
                'type': SetValueCmd.type.text,
                'fieldId': 'padding_bottom',
                'rowId': 'rbro_doc_element_padding_row',
                'singleRowProperty': false,
                'section': 'style'
            },
            'groupExpression': {
                'type': SetValueCmd.type.text,
                'fieldId': 'group_expression',
                'section': 'print'
            },
            'pageBreak': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'page_break',
                'visibleIf': 'groupExpression',
                'section': 'print'
            },
            'repeatGroupHeader': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'repeat_group_header',
                'visibleIf': 'groupExpression',
                'section': 'print'
            },
            'printIf': {
                'type': SetValueCmd.type.text,
                'fieldId': 'print_if',
                'section': 'print'
            },
            'repeatHeader': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'repeat_header',
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
            'alignToPageBottom': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'align_to_page_bottom',
                'section': 'print'
            },
            'growWeight': {
                'type': SetValueCmd.type.select,
                'allowEmpty': false,
                'fieldId': 'grow_weight',
                'section': 'print'
            },
            'pattern': {
                'type': SetValueCmd.type.text,
                'fieldId': 'pattern',
                'section': 'print',
                'visibleIf': '!richText'
            },
            'link': {
                'type': SetValueCmd.type.text,
                'fieldId': 'link',
                'section': 'print',
                'visibleIf': '!richText'
            },
            'cs_condition': {
                'type': SetValueCmd.type.text,
                'fieldId': 'cs_condition',
                'section': 'cs_style'
            },
            'cs_styleId': {
                'type': SetValueCmd.type.select,
                'fieldId': 'cs_style_id',
                'section': 'cs_style',
                'allowEmpty': true
            },
            'cs_additionalRules': {
                'type': SetValueCmd.type.internal,
                'fieldId': 'cs_additional_rules',
                'section': 'cs_style',
                'allowEmpty': true
            },
            'cs_bold': {
                'type': SetValueCmd.type.button,
                'fieldId': 'cs_bold',
                'rowId': 'rbro_doc_element_cs_textstyle_row',
                'singleRowProperty': false,
                'rowProperties': ['cs_bold', 'cs_italic', 'cs_underline', 'cs_strikethrough'],
                'section': 'cs_style',
                'visibleIf': '!richText'
            },
            'cs_italic': {
                'type': SetValueCmd.type.button,
                'fieldId': 'cs_italic',
                'rowId': 'rbro_doc_element_cs_textstyle_row',
                'singleRowProperty': false,
                'section': 'cs_style',
                'visibleIf': '!richText'
            },
            'cs_underline': {
                'type': SetValueCmd.type.button,
                'fieldId': 'cs_underline',
                'rowId': 'rbro_doc_element_cs_textstyle_row',
                'singleRowProperty': false,
                'section': 'cs_style',
                'visibleIf': '!richText'
            },
            'cs_strikethrough': {
                'type': SetValueCmd.type.button,
                'fieldId': 'cs_strikethrough',
                'rowId': 'rbro_doc_element_cs_textstyle_row',
                'singleRowProperty': false,
                'section': 'cs_style',
                'visibleIf': '!richText'
            },
            'cs_horizontalAlignment': {
                'type': SetValueCmd.type.buttonGroup,
                'fieldId': 'cs_halignment',
                'rowId': 'rbro_doc_element_cs_alignment_row',
                'singleRowProperty': false,
                'rowProperties': ['cs_horizontalAlignment', 'cs_verticalAlignment'],
                'section': 'cs_style',
                'visibleIf': '!richText'
            },
            'cs_verticalAlignment': {
                'type': SetValueCmd.type.buttonGroup,
                'fieldId': 'cs_valignment',
                'rowId': 'rbro_doc_element_cs_alignment_row',
                'singleRowProperty': false,
                'section': 'cs_style'
            },
            'cs_textColor': {
                'type': SetValueCmd.type.color,
                'allowEmpty': false,
                'fieldId': 'cs_text_color',
                'section': 'cs_style',
                'visibleIf': '!richText'
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
                'singleRowProperty': false,
                'rowProperties': ['cs_font', 'cs_fontSize'],
                'section': 'cs_style',
                'allowEmpty': false,
                'visibleIf': '!richText'
            },
            'cs_fontSize': {
                'type': SetValueCmd.type.select,
                'fieldId': 'cs_font_size',
                'rowId': 'rbro_doc_element_cs_font_row',
                'singleRowProperty': false,
                'section': 'cs_style',
                'allowEmpty': false,
                'visibleIf': '!richText'
            },
            'cs_lineSpacing': {
                'type': SetValueCmd.type.select,
                'fieldId': 'cs_line_spacing',
                'section': 'cs_style',
                'allowEmpty': false
            },
            'cs_borderAll': {
                'type': SetValueCmd.type.button,
                'fieldId': 'cs_border_all',
                'rowId': 'rbro_doc_element_cs_border_row',
                'singleRowProperty': false,
                'rowProperties': [
                    'cs_borderAll', 'cs_borderLeft', 'cs_borderTop', 'cs_borderRight', 'cs_borderBottom'
                ],
                'section': 'cs_style'
            },
            'cs_borderLeft': {
                'type': SetValueCmd.type.button,
                'fieldId': 'cs_border_left',
                'rowId': 'rbro_doc_element_cs_border_row',
                'singleRowProperty': false,
                'section': 'cs_style'
            },
            'cs_borderTop': {
                'type': SetValueCmd.type.button,
                'fieldId': 'cs_border_top',
                'rowId': 'rbro_doc_element_cs_border_row',
                'singleRowProperty': false,
                'section': 'cs_style'
            },
            'cs_borderRight': {
                'type': SetValueCmd.type.button,
                'fieldId': 'cs_border_right',
                'rowId': 'rbro_doc_element_cs_border_row',
                'singleRowProperty': false,
                'section': 'cs_style'
            },
            'cs_borderBottom': {
                'type': SetValueCmd.type.button,
                'fieldId': 'cs_border_bottom',
                'rowId': 'rbro_doc_element_cs_border_row',
                'singleRowProperty': false,
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
                'singleRowProperty': false,
                'rowProperties': ['paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom'],
                'section': 'cs_style'
            },
            'cs_paddingTop': {
                'type': SetValueCmd.type.text,
                'fieldId': 'cs_padding_top',
                'rowId': 'rbro_doc_element_cs_padding_row',
                'singleRowProperty': false,
                'section': 'cs_style'
            },
            'cs_paddingRight': {
                'type': SetValueCmd.type.text,
                'fieldId': 'cs_padding_right',
                'rowId': 'rbro_doc_element_cs_padding_row',
                'singleRowProperty': false,
                'section': 'cs_style'
            },
            'cs_paddingBottom': {
                'type': SetValueCmd.type.text,
                'fieldId': 'cs_padding_bottom',
                'rowId': 'rbro_doc_element_cs_padding_row',
                'singleRowProperty': false,
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
            },
            'spreadsheet_type': {
                'type': SetValueCmd.type.select,
                'fieldId': 'spreadsheet_type',
                'section': 'spreadsheet'
            },
            'spreadsheet_pattern': {
                'type': SetValueCmd.type.text,
                'fieldId': 'spreadsheet_pattern',
                'section': 'spreadsheet',
                'visibleIf': 'spreadsheet_type'
            },
            'spreadsheet_textWrap': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'spreadsheet_text_wrap',
                'section': 'spreadsheet'
            }
        };

        if (!rb.getProperty('showPlusFeatures')) {
            // remove all properties of PLUS version
            delete this.propertyDescriptors['richText'];
            delete this.propertyDescriptors['richTextContent'];
        }

        super.initVisibleIfFields();
    }

    render() {
        let elDiv, elFormField, elParameterButton;
        let panel = utils.createElement('div', { id: 'rbro_doc_element_panel', class: 'rbroHidden' });

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_label_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementLabel'), 'rbro_doc_element_label');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elLabel = utils.createElement('input', { id: 'rbro_doc_element_label', autocomplete: 'off' });
        elLabel.addEventListener('input', (event) => {
            let val = elLabel.value;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'label', val, SetValueCmd.type.text, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(elLabel);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_data_source_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementDataSource'), 'rbro_doc_element_data_source');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elSplit = utils.createElement('div', { class: 'rbroSplit rbroSelector' });
        let elDataSource = utils.createElement('textarea', { id: 'rbro_doc_element_data_source', rows: 1 });
        elDataSource.addEventListener('input', (event) => {
            let val = elDataSource.value;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'dataSource', val, SetValueCmd.type.text, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        autosize(elDataSource);
        elSplit.append(elDataSource);
        elParameterButton = utils.createElement('div', { class: 'rbroButton rbroRoundButton rbroIcon-select' });
        elParameterButton.addEventListener('click', (event) => {
            let selectedObjects = this.rb.getSelectedObjects();
            // data source parameters are not shown in case multiple objects are selected
            let selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;

            this.rb.getPopupWindow().show(
                this.rb.getParameterItems(selectedObject, [Parameter.type.array]),
                null, 'rbro_doc_element_data_source', 'dataSource', PopupWindow.type.parameterSet);
        });
        elSplit.append(elParameterButton);
        elFormField.append(elSplit);
        elFormField.append(
            utils.createElement('div', { id: 'rbro_doc_element_data_source_error', class: 'rbroErrorMessage' })
        );
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_content_row', class: 'rbroFormRow rbroHidden' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementContent'), 'rbro_doc_element_content');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        elSplit = utils.createElement('div', { class: 'rbroSplit rbroSelector' });
        let elContent = utils.createElement('textarea', { id: 'rbro_doc_element_content', rows: 1 });
        elContent.addEventListener('input', (event) => {
            let val = elContent.value;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'content', val, SetValueCmd.type.text, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elContent.addEventListener('blur', (event) => {
            this.rb.getPopupWindow().hide();
        });
        autosize(elContent);
        elSplit.append(elContent);
        elParameterButton = utils.createElement('div', { class: 'rbroButton rbroRoundButton rbroIcon-select' });
        elParameterButton.addEventListener('click', (event) => {
            let selectedObjects = this.rb.getSelectedObjects();
            // data source parameters are not shown in case multiple objects are selected
            let selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;

            this.rb.getPopupWindow().show(
                this.rb.getParameterItems(selectedObject, null), null,
                'rbro_doc_element_content', 'content', PopupWindow.type.parameterAppend);
        });
        elSplit.append(elParameterButton);
        elFormField.append(elSplit);
        elFormField.append(
            utils.createElement('div', { id: 'rbro_doc_element_content_error', class: 'rbroErrorMessage' })
        );
        elDiv.append(elFormField);
        panel.append(elDiv);

        // Rich-Text-Editor
        if (this.rb.getProperty('showPlusFeatures')) {
            elDiv = utils.createElement('div', { id: 'rbro_doc_element_rich_text_row', class: 'rbroFormRow' });
            utils.appendLabel(elDiv, this.rb.getLabel('docElementRichText'), 'rbro_doc_element_rich_text');
            elFormField = utils.createElement('div', { class: 'rbroFormField' });
            let elRichTextLabel = utils.createElement('label', { class: 'switch-light switch-material' });
            let elRichText = utils.createElement('input', { id: 'rbro_doc_element_rich_text', type: 'checkbox' });
            elRichText.addEventListener('change', (event) => {
                let richTextChecked = elRichText.checked;
                let cmdGroup = new CommandGroupCmd('Set value', this.rb);
                let selectedObjects = this.rb.getSelectedObjects();
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), 'richText', richTextChecked, SetValueCmd.type.checkbox, this.rb));
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            });
            elRichTextLabel.append(elRichText);
            let elRichTextSpan = utils.createElement('span');
            elRichTextSpan.append(utils.createElement('span'));
            elRichTextSpan.append(utils.createElement('span'));
            elRichTextSpan.append(utils.createElement('a'));
            elRichTextLabel.append(elRichTextSpan);
            elFormField.append(elRichTextLabel);
            elFormField.append(
                utils.createElement('div', { id: 'rbro_doc_element_rich_text_error', class: 'rbroErrorMessage' })
            );
            if (this.rb.getProperty('showPlusFeaturesInfo')) {
                const elInfoText = utils.createElement('div', { class: 'rbroInfo' });
                elInfoText.innerHTML = this.rb.getLabel('plusFeatureInfo');
                elFormField.append(elInfoText);
            }
            elDiv.append(elFormField);
            panel.append(elDiv);

            elDiv = utils.createElement(
                'div', {
                    id: 'rbro_doc_element_rich_text_content_row',
                    class: 'rbroFormRow rbroRichTextEditor rbroHidden'
                });

            let colors = this.rb.getProperty('colors');
            const elRichTextColor = utils.createElement(
                'select', { class: 'ql-color', title: this.rb.getLabel('styleTextColor') });
            const elRichTextBackgroundColor = utils.createElement(
                'select', { class: 'ql-background', title: this.rb.getLabel('styleBackgroundColor') });
            for (let color of colors) {
                elRichTextColor.append(utils.createElement('option', { value: color }, color));
                elRichTextBackgroundColor.append(utils.createElement('option', { value: color }, color));
            }
            elRichTextColor.append(utils.createElement('option', { value: 'clear-color' }));
            elRichTextBackgroundColor.append(utils.createElement('option', { value: 'clear-color' }));

            const elRichTextFont = utils.createElement('select', { class: 'ql-font' });
            const defaultFont = this.rb.getProperty('defaultFont');
            for (let font of this.rb.getFonts()) {
                const props = { value: font.value };
                if (font.value === defaultFont) {
                    props.selected = 'selected';
                }
                elRichTextFont.append(utils.createElement('option', props, font.name));
            }
            const elRichTextFontSize = utils.createElement('select', { class: 'ql-size' });
            for (let size of this.rb.getProperty('fontSizes')) {
                const props = { value: size + 'px' };
                if (size === 12) {
                    props.selected = 'selected';
                }
                elRichTextFontSize.append(utils.createElement('option', props, size + 'pt'));
            }

            const elToolbar = utils.createElement('div', { id: 'rbro_doc_element_rich_text_content_toolbar' });
            let elToolbarBlock = utils.createElement('span', { class: 'ql-formats' });
            elToolbarBlock.append(
                utils.createElement('button', { class: 'ql-bold', title: this.rb.getLabel('styleBold') }));
            elToolbarBlock.append(
                utils.createElement('button', { class: 'ql-italic', title: this.rb.getLabel('styleItalic') }));
            elToolbarBlock.append(
                utils.createElement('button', { class: 'ql-underline', title: this.rb.getLabel('styleUnderline') }));
            elToolbarBlock.append(
                utils.createElement('button', { class: 'ql-strike', title: this.rb.getLabel('styleStrikethrough') }));
            elToolbar.append(elToolbarBlock);

            elToolbarBlock = utils.createElement('span', { class: 'ql-formats' });
            elToolbarBlock.append(utils.createElement('button', { class: 'ql-link' }));
            elToolbar.append(elToolbarBlock);

            elToolbarBlock = utils.createElement('span', { class: 'ql-formats' });
            elToolbarBlock.append(
                utils.createElement('select', { class: 'ql-align', title: this.rb.getLabel('styleAlignment') }));
            elToolbar.append(elToolbarBlock);

            elToolbarBlock = utils.createElement('span', { class: 'ql-formats' });
            elToolbarBlock.append(elRichTextColor);
            elToolbarBlock.append(elRichTextBackgroundColor);
            elToolbar.append(elToolbarBlock);

            elToolbar.append(elRichTextFont);
            elToolbar.append(elRichTextFontSize);

            elToolbar.append(utils.createElement(
                'div', {
                    id: 'rbro_doc_element_rich_text_content_toolbar_parameter',
                    class: 'rbroButton rbroRoundButton rbroIcon-select'
                })
            );
            elDiv.append(elToolbar);

            let elRichTextContent = utils.createElement('div', { id: 'rbro_doc_element_rich_text_content' });
            elDiv.append(elRichTextContent);
            elDiv.append(
                utils.createElement(
                    'div', { id: 'rbro_doc_element_rich_text_content_error', class: 'rbroErrorMessage' })
            );
            panel.append(elDiv);
        }

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_eval_row', class: 'rbroFormRow rbroHidden' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementEval'), 'rbro_doc_element_eval');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elEval = utils.createElement('input', { id: 'rbro_doc_element_eval', type: 'checkbox' });
        elEval.addEventListener('change', (event) => {
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            let evalChecked = elEval.checked;
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'eval', evalChecked, SetValueCmd.type.checkbox, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(elEval);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_format_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementFormat'), 'rbro_doc_element_format');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elFormat = utils.createElement('select', { id: 'rbro_doc_element_format' });
        elFormat.append(utils.createElement('option', { value: 'CODE39' }, 'CODE39'));
        elFormat.append(utils.createElement('option', { value: 'CODE128' }, 'CODE128'));
        elFormat.append(utils.createElement('option', { value: 'EAN8' }, 'EAN-8'));
        elFormat.append(utils.createElement('option', { value: 'EAN13' }, 'EAN-13'));
        elFormat.append(utils.createElement('option', { value: 'UPC' }, 'UPC'));
        elFormat.append(utils.createElement('option', { value: 'QRCode' }, 'QR Code'));
        elFormat.addEventListener('change', (event) => {
            let val = elFormat.value;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'format', val, SetValueCmd.type.select, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(elFormat);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_display_value_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementDisplayValue'), 'rbro_doc_element_display_value');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elDisplayValue = utils.createElement('input', { id: 'rbro_doc_element_display_value', type: 'checkbox' });
        elDisplayValue.addEventListener('change', (event) => {
            let displayValueChecked = elDisplayValue.checked;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(),'displayValue', displayValueChecked, SetValueCmd.type.checkbox, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(elDisplayValue);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_bar_width_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementBarWidth'), 'rbro_doc_element_bar_width');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elBarWidth = utils.createElement(
            'input', { id: 'rbro_doc_element_bar_width', type: 'number', step: '0.1', autocomplete: 'off' });
        elBarWidth.addEventListener('input', (event) => {
            let val = elBarWidth.value;
            if (val !== '') {
                val = utils.checkInputDecimal(val, 0.3, 3);
            }
            if (val !== elBarWidth.value) {
                elBarWidth.value = val;
            }
            let selectedObjects = this.rb.getSelectedObjects();
            let valueChanged = false;
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                if (selectedObjects[i].getValue('barWidth') !== val) {
                    valueChanged = true;
                    break;
                }
            }

            if (valueChanged) {
                let cmdGroup = new CommandGroupCmd('Set value', this.rb);
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), 'barWidth', val, SetValueCmd.type.text, this.rb));
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            }
        });
        elFormField.append(elBarWidth);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_guard_bar_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementGuardBar'), 'rbro_doc_element_guard_bar');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elGuardBar = utils.createElement('input', { id: 'rbro_doc_element_guard_bar', type: 'checkbox' });
        elGuardBar.addEventListener('change', (event) => {
            let guardBarChecked = elGuardBar.checked;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(),'guardBar', guardBarChecked, SetValueCmd.type.checkbox, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(elGuardBar);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_rotate_row', class: 'rbroFormRow' });
        utils.appendLabel(
            elDiv, this.rb.getLabel('docElementRotate'), 'rbro_doc_element_rotate');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elRotate = utils.createElement('input', { id: 'rbro_doc_element_rotate', type: 'checkbox' });
        elRotate.addEventListener('change', (event) => {
            let rotateChecked = elRotate.checked;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'rotate', rotateChecked, SetValueCmd.type.checkbox, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(elRotate);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_error_correction_level_row', class: 'rbroFormRow' });
        utils.appendLabel(
            elDiv, this.rb.getLabel('docElementErrorCorrectionLevel'), 'rbro_doc_element_error_correction_level');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elErrorCorrectionLevel = utils.createElement('select', { id: 'rbro_doc_element_error_correction_level' });
        elErrorCorrectionLevel.append(
            utils.createElement('option', { value: 'L' }, this.rb.getLabel('docElementErrorCorrectionLevelLow')));
        elErrorCorrectionLevel.append(
            utils.createElement('option', { value: 'M' }, this.rb.getLabel('docElementErrorCorrectionLevelMedium')));
        elErrorCorrectionLevel.append(
            utils.createElement('option', { value: 'Q' }, this.rb.getLabel('docElementErrorCorrectionLevelQuartile')));
        elErrorCorrectionLevel.append(
            utils.createElement('option', { value: 'H' }, this.rb.getLabel('docElementErrorCorrectionLevelHigh')));
        elErrorCorrectionLevel.addEventListener('change', (event) => {
            let val = elErrorCorrectionLevel.value;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'errorCorrectionLevel', val, SetValueCmd.type.select, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(elErrorCorrectionLevel);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_source_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementSource'), 'rbro_doc_element_source');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        elSplit = utils.createElement('div', { class: 'rbroSplit rbroSelector' });
        let elSource = utils.createElement('textarea', { id: 'rbro_doc_element_source', rows: 1 });
        elSource.addEventListener('input', (event) => {
            let val = elSource.value;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'source', val, SetValueCmd.type.text, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        autosize(elSource);
        elSplit.append(elSource);
        elParameterButton = utils.createElement('div', { class: 'rbroButton rbroRoundButton rbroIcon-select' });
        elParameterButton.addEventListener('click', (event) => {
            let selectedObjects = this.rb.getSelectedObjects();
            // data source parameters are not shown in case multiple objects are selected
            let selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;

            this.rb.getPopupWindow().show(
                this.rb.getParameterItems(selectedObject, [Parameter.type.image, Parameter.type.string]),
                null, 'rbro_doc_element_source', 'source', PopupWindow.type.parameterSet);
        });
        elSplit.append(elParameterButton);
        elFormField.append(elSplit);
        elFormField.append(
            utils.createElement('div', { id: 'rbro_doc_element_source_error', class: 'rbroErrorMessage' })
        );
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_image_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementImageFile'), 'rbro_doc_element_image');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elImage = utils.createElement('input', { id: 'rbro_doc_element_image', type: 'file' });
        elImage.addEventListener('change', (event) => {
            const rb = this.rb;

            function setImage(imageData, imageFileName) {
                const cmdGroup = new CommandGroupCmd('Load image', rb);
                const selectedObjects = rb.getSelectedObjects();
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    const obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), 'image', imageData, SetValueCmd.type.file, rb));
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), 'imageFilename', imageFileName, SetValueCmd.type.filename, rb));
                }
                if (!cmdGroup.isEmpty()) {
                    rb.executeCommand(cmdGroup);
                }
            }

            const files = event.target.files;
            if (files && files[0]) {
                utils.readImageData(files[0], setImage, this.rb);
            }
        });
        elFormField.append(elImage);
        let elFilenameDiv = utils.createElement(
            'div', { id: 'rbro_doc_element_image_filename_container', class: 'rbroImageFile rbroHidden' });
        elFilenameDiv.append(utils.createElement('div', { id: 'rbro_doc_element_image_filename' }));
        const elImageFilenameClear = utils.createElement(
            'div', {
                id: 'rbro_doc_element_image_filename_clear',
                class: 'rbroIcon-cancel rbroButton rbroDeleteButton rbroRoundButton'
            });
        elImageFilenameClear.addEventListener('click', (event) => {
            elImage.value = '';
            let cmdGroup = new CommandGroupCmd('Clear image', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'image', '', SetValueCmd.type.file, this.rb));
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'imageFilename', '', SetValueCmd.type.filename, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFilenameDiv.append(elImageFilenameClear);
        elFormField.append(elFilenameDiv);
        elFormField.append(
            utils.createElement('div', { id: 'rbro_doc_element_image_error', class: 'rbroErrorMessage' })
        );
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_x_read_only_row', class: 'rbroFormRow' });
        utils.appendLabel(
            elDiv, this.rb.getLabel('docElementPositionX'), 'rbro_doc_element_x_read_only', { class: 'rbroDisabled' });
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elXReadOnly = utils.createElement('input', { id: 'rbro_doc_element_x_read_only', disabled: 'disabled' });
        elFormField.append(elXReadOnly);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_position_row', class: 'rbroFormRow rbroHidden' });
        utils.appendLabel(
            elDiv, this.rb.getLabel('docElementPosition'), 'rbro_doc_element_x',
            { id: 'rbro_doc_element_position_label' });
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        elSplit = utils.createElement('div', { class: 'rbroSplit' });
        let elPosX = utils.createElement('input', { id: 'rbro_doc_element_x', type: 'number', autocomplete: 'off' });
        elPosX.addEventListener('input', (event) => {
            let val = elPosX.value;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'x', val, SetValueCmd.type.text, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elSplit.append(elPosX);
        let elPosY = utils.createElement('input', { id: 'rbro_doc_element_y', type: 'number', autocomplete: 'off' });
        elPosY.addEventListener('input', (event) => {
            let val = elPosY.value;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'y', val, SetValueCmd.type.text, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elSplit.append(elPosY);
        elFormField.append(elSplit);
        elFormField.append(
            utils.createElement('div', { id: 'rbro_doc_element_position_error', class: 'rbroErrorMessage' })
        );
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_size_row', class: 'rbroFormRow rbroHidden' });
        utils.appendLabel(
            elDiv, this.rb.getLabel('docElementSize'), 'rbro_doc_element_size', { id: 'rbro_doc_element_size_label' });
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        elSplit = utils.createElement('div', { class: 'rbroSplit' });
        let elWidth = utils.createElement(
            'input', { id: 'rbro_doc_element_width', type: 'number', autocomplete: 'off' });
        elWidth.addEventListener('input', (event) => {
            let val = elWidth.value;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'width', val, SetValueCmd.type.text, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elSplit.append(elWidth);
        let elHeight = utils.createElement(
            'input', {id: 'rbro_doc_element_height', type: 'number', autocomplete: 'off'});
        elHeight.addEventListener('input', (event) => {
            let val = elHeight.value;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'height', val, SetValueCmd.type.text, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elSplit.append(elHeight);
        elFormField.append(elSplit);
        elFormField.append(
            utils.createElement('div', { id: 'rbro_doc_element_size_error', class: 'rbroErrorMessage' })
        );
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_colspan_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementColspan'), 'rbro_doc_element_colspan');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elColspan = utils.createElement(
          'input', { id: 'rbro_doc_element_colspan', type: 'number', autocomplete: 'off' });
        elColspan.addEventListener('change', (event) => {
            let val = elColspan.value.trim();
            if (val !== '') {
                val = utils.checkInputDecimal(val, 1, 9);
            }
            if (val !== elColspan.value) {
                elColspan.value = val;
            }
            let selectedObjects = this.rb.getSelectedObjects();
            let valueChanged = false;
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                if (selectedObjects[i].getValue('colspan') !== val) {
                    valueChanged = true;
                    break;
                }
            }

            if (valueChanged) {
                let cmdGroup = new CommandGroupCmd('Set value', this.rb);
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), 'colspan', val, SetValueCmd.type.text, this.rb));
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            }
        });
        elFormField.append(elColspan);
        elFormField.append(
            utils.createElement('div', { id: 'rbro_doc_element_colspan_error', class: 'rbroErrorMessage' })
        );
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_columns_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementColumns'), 'rbro_doc_element_columns');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elColumns = utils.createElement(
          'input', { id: 'rbro_doc_element_columns', type: 'number', autocomplete: 'off' });
        elColumns.addEventListener('change', (event) => {
            let val = utils.checkInputDecimal(elColumns.value, 1, 99);
            if (val !== elColumns.value) {
                elColumns.value = val;
            }
            let columns = utils.convertInputToNumber(val);
            let selectedObjects = this.rb.getSelectedObjects();
            let valueChanged = false;
            let enoughSpaceAvailable = true;
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                if (obj.getValue('columns') !== val) {
                    valueChanged = true;
                }
                if (!obj.hasEnoughAvailableSpace(columns)) {
                    enoughSpaceAvailable = false;
                }
            }

            if (!enoughSpaceAvailable && selectedObjects.length === 1) {
                // reset input to current column count
                elColumns.value = selectedObjects[0].getValue('columns');
            }

            if (valueChanged && enoughSpaceAvailable) {
                let cmdGroup = new CommandGroupCmd('Set value', this.rb);
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    obj.addCommandsForChangedColumns(columns, cmdGroup);
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            }
        });
        elFormField.append(elColumns);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_header_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('header'), 'rbro_doc_element_header');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elHeaderLabel = utils.createElement('label', { class: 'switch-light switch-material' });
        let elHeader = utils.createElement('input', { id: 'rbro_doc_element_header', type: 'checkbox' });
        elHeader.addEventListener('change', (event) => {
            let headerChecked = elHeader.checked;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'header', headerChecked, SetValueCmd.type.checkbox, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
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
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_content_rows_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementContentRows'), 'rbro_doc_element_content_rows');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elContentRows = utils.createElement(
          'input', { id: 'rbro_doc_element_content_rows', type: 'number', autocomplete: 'off' });
        elContentRows.addEventListener('change', (event) => {
            let val = utils.checkInputDecimal(elContentRows.value, 1, 99);
            let contentRows = utils.convertInputToNumber(val);
            if (val !== elContentRows.value) {
                elContentRows.value = val;
            }
            let selectedObjects = this.rb.getSelectedObjects();
            let valueChanged = false;
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                if (selectedObjects[i].getValue('contentRows') !== val) {
                    valueChanged = true;
                    break;
                }
            }

            if (valueChanged) {
                let cmdGroup = new CommandGroupCmd('Set value', this.rb);
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    obj.addCommandsForChangedContentRows(contentRows, cmdGroup);
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            }
        });
        elFormField.append(elContentRows);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_footer_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('footer'), 'rbro_doc_element_footer');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elFooterLabel = utils.createElement('label', { class: 'switch-light switch-material' });
        let elFooter = utils.createElement('input', { id: 'rbro_doc_element_footer', type: 'checkbox' });
        elFooter.addEventListener('change', (event) => {
            let footerChecked = elFooter.checked;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'footer', footerChecked, SetValueCmd.type.checkbox, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFooterLabel.append(elFooter);
        let elFooterSpan = utils.createElement('span')
        elFooterSpan.append(utils.createElement('span'));
        elFooterSpan.append(utils.createElement('span'));
        elFooterSpan.append(utils.createElement('a'));
        elFooterLabel.append(elFooterSpan);
        elFormField.append(elFooterLabel);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_rotate_deg_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementRotateDeg'), 'rbro_doc_element_rotate_deg');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elRotateDeg = utils.createElement(
            'input', { id: 'rbro_doc_element_rotate_deg', type: 'number', step: '15', autocomplete: 'off' });
        elRotateDeg.addEventListener('input', (event) => {
            let val = elRotateDeg.value;
            if (val !== '') {
                val = utils.checkInputDecimal(val, 0, 360);
            }
            if (val !== elRotateDeg.value) {
                elRotateDeg.value = val;
            }
            let selectedObjects = this.rb.getSelectedObjects();
            let valueChanged = false;
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                if (selectedObjects[i].getValue('rotateDeg') !== val) {
                    valueChanged = true;
                    break;
                }
            }

            if (valueChanged) {
                let cmdGroup = new CommandGroupCmd('Set value', this.rb);
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), 'rotateDeg', val, SetValueCmd.type.text, this.rb));
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            }
        });
        elFormField.append(elRotateDeg);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_opacity_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementOpacity'), 'rbro_doc_element_opacity');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elOpacity = utils.createElement(
            'input', { id: 'rbro_doc_element_opacity', type: 'number', step: '10', autocomplete: 'off' });
        elOpacity.addEventListener('input', (event) => {
            let val = elOpacity.value;
            if (val !== '') {
                val = utils.checkInputDecimal(val, 0, 100);
            }
            if (val !== elOpacity.value) {
                elOpacity.value = val;
            }
            let selectedObjects = this.rb.getSelectedObjects();
            let valueChanged = false;
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                if (selectedObjects[i].getValue('opacity') !== val) {
                    valueChanged = true;
                    break;
                }
            }

            if (valueChanged) {
                let cmdGroup = new CommandGroupCmd('Set value', this.rb);
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), 'opacity', val, SetValueCmd.type.text, this.rb));
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            }
        });
        elFormField.append(elOpacity);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = utils.createElement(
          'div', { id: 'rbro_doc_element_show_in_foreground_row', class: 'rbroFormRow rbroHidden' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementShowInForeground'), 'rbro_doc_element_show_in_foreground');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elShowInForeground = utils.createElement(
          'input', { id: 'rbro_doc_element_show_in_foreground', type: 'checkbox' });
        elShowInForeground.addEventListener('change', (event) => {
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            let showInForegroundChecked = elShowInForeground.checked;
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'showInForeground', showInForegroundChecked, SetValueCmd.type.checkbox, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(elShowInForeground);
        elDiv.append(elFormField);
        panel.append(elDiv);

        // ---------------------------
        // --- Style Section Begin ---
        // ---------------------------
        let elStyleSectionContainer = utils.createElement('div', { id: 'rbro_doc_element_style_section_container' });
        let elStyleHeader = utils.createElement('div', { class: 'rbroPanelSectionHeader' });
        let elStyleHeaderIcon = utils.createElement(
            'span', { id: 'rbro_doc_element_style_header_icon', class: 'rbroIcon-minus' });
        elDiv = utils.createElement(
            'div', {
                id: 'rbro_doc_element_style_header',
                class: 'rbroFormRow rbroPanelSection rbroPanelSectionHeaderOpen'
            });
        elDiv.addEventListener('click', (event) => {
            document.getElementById('rbro_doc_element_style_header').classList.toggle('rbroPanelSectionHeaderOpen');
            document.getElementById('rbro_doc_element_style_section').classList.toggle('rbroHidden');
            elStyleHeaderIcon.classList.toggle('rbroIcon-plus');
            elStyleHeaderIcon.classList.toggle('rbroIcon-minus');
            if (elStyleHeaderIcon.classList.contains('rbroIcon-minus')) {
                const sectionOffset = document.getElementById('rbro_doc_element_style_section_container').offsetTop;
                document.getElementById('rbro_detail_panel').scrollTop = sectionOffset;
            }
        });
        elStyleHeader.append(elStyleHeaderIcon);
        elStyleHeader.append(utils.createElement('span', {}, this.rb.getLabel('docElementStyle')));
        elDiv.append(elStyleHeader);
        elStyleSectionContainer.append(elDiv);

        let elStyleSectionDiv = utils.createElement('div', { id: 'rbro_doc_element_style_section' });

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_style_id_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementStyle'), 'rbro_doc_element_style_id');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        this.elStyle = utils.createElement('select', { id: 'rbro_doc_element_style_id' });
        this.elStyle.addEventListener('change', (event) => {
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                obj.addCommandsForChangedStyle(
                    this.elStyle.value, '', this.propertyDescriptors, cmdGroup);
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(this.elStyle);
        elDiv.append(elFormField);
        elStyleSectionDiv.append(elDiv);

        let elStyleDiv = utils.createElement('div', { id: 'rbro_doc_element_style_settings' });
        StylePanel.renderStyle(elStyleDiv, 'doc_element_', '', true, this.controls, this.rb);
        elStyleSectionDiv.append(elStyleDiv);
        elStyleSectionContainer.append(elStyleSectionDiv);
        panel.append(elStyleSectionContainer);
        // -------------------------
        // --- Style Section End ---
        // -------------------------

        // ---------------------------
        // --- Print Section Begin ---
        // ---------------------------
        let elPrintSectionContainer = utils.createElement('div', { id: 'rbro_doc_element_print_section_container' });
        let elPrintHeader = utils.createElement('div', { class: 'rbroPanelSectionHeader' });
        let elPrintHeaderIcon = utils.createElement(
            'span', { id: 'rbro_doc_element_print_header_icon', class: 'rbroIcon-plus' });
        elDiv = utils.createElement(
            'div', { id: 'rbro_doc_element_print_header', class: 'rbroFormRow rbroPanelSection' });
        elDiv.addEventListener('click', (event) => {
            document.getElementById('rbro_doc_element_print_header').classList.toggle('rbroPanelSectionHeaderOpen');
            document.getElementById('rbro_doc_element_print_section').classList.toggle('rbroHidden');
            elPrintHeaderIcon.classList.toggle('rbroIcon-plus');
            elPrintHeaderIcon.classList.toggle('rbroIcon-minus');
            if (elPrintHeaderIcon.classList.contains('rbroIcon-minus')) {
                const sectionOffset = document.getElementById('rbro_doc_element_print_section_container').offsetTop;
                document.getElementById('rbro_detail_panel').scrollTop = sectionOffset;
            }
            autosize.update(document.getElementById('rbro_doc_element_print_if'));
        });
        elPrintHeader.append(elPrintHeaderIcon);
        elPrintHeader.append(utils.createElement('span', {}, this.rb.getLabel('docElementPrintSettings')));
        elDiv.append(elPrintHeader);
        elPrintSectionContainer.append(elDiv);

        let elPrintSectionDiv = utils.createElement(
            'div', { id: 'rbro_doc_element_print_section', class: 'rbroHidden' });

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_group_expression_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementGroupExpression'), 'rbro_doc_element_group_expression');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        elSplit = utils.createElement('div', { class: 'rbroSplit rbroSelector' });
        let elGroupExpression = utils.createElement('textarea', { id: 'rbro_doc_element_group_expression', rows: 1 });
        elGroupExpression.addEventListener('input', (event) => {
            let val = elGroupExpression.value;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'groupExpression', val, SetValueCmd.type.text, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elGroupExpression.addEventListener('blur', (event) => {
            this.rb.getPopupWindow().hide();
        });
        autosize(elGroupExpression);
        elSplit.append(elGroupExpression);
        elParameterButton = utils.createElement('div', { class: 'rbroButton rbroRoundButton rbroIcon-select' });
        elParameterButton.addEventListener('click', (event) => {
            let selectedObjects = this.rb.getSelectedObjects();
            // data source parameters are not shown in case multiple objects are selected
            let selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;

            this.rb.getPopupWindow().show(
                this.rb.getParameterItems(selectedObject, null), null,
                'rbro_doc_element_group_expression', 'groupExpression', PopupWindow.type.parameterSet);
        });
        elSplit.append(elParameterButton);
        elFormField.append(elSplit);
        elFormField.append(
            utils.createElement('div', { id: 'rbro_doc_element_group_expression_error', class: 'rbroErrorMessage' })
        );
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_page_break_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementTableBandPageBreak'), 'rbro_doc_element_page_break');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elPageBreak = utils.createElement('input', { id: 'rbro_doc_element_page_break', type: 'checkbox' });
        elPageBreak.addEventListener('change', (event) => {
            let pageBreakChecked = elPageBreak.checked;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'pageBreak', pageBreakChecked,
                    SetValueCmd.type.checkbox, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(elPageBreak);
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_repeat_group_header_row', class: 'rbroFormRow' });
        utils.appendLabel(
            elDiv, this.rb.getLabel('docElementRepeatGroupHeader'), 'rbro_doc_element_repeat_group_header');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elRepeatGroupHeader = utils.createElement(
            'input', { id: 'rbro_doc_element_repeat_group_header', type: 'checkbox' });
        elRepeatGroupHeader.addEventListener('change', (event) => {
            let repeatGroupHeaderChecked = elRepeatGroupHeader.checked;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'repeatGroupHeader', repeatGroupHeaderChecked,
                    SetValueCmd.type.checkbox, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(elRepeatGroupHeader);
        elFormField.append(
            utils.createElement('div', { id: 'rbro_doc_element_repeat_group_header_error', class: 'rbroErrorMessage' })
        );
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_print_if_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementPrintIf'), 'rbro_doc_element_print_if');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        elSplit = utils.createElement('div', { class: 'rbroSplit rbroSelector' });
        let elPrintIf = utils.createElement('textarea', { id: 'rbro_doc_element_print_if', rows: 1 });
        elPrintIf.addEventListener('input', (event) => {
            let val = elPrintIf.value;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'printIf', val, SetValueCmd.type.text, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        autosize(elPrintIf);
        elSplit.append(elPrintIf);
        elParameterButton = utils.createElement('div', { class: 'rbroButton rbroRoundButton rbroIcon-select' });
        elParameterButton.addEventListener('click', (event) => {
            let selectedObjects = this.rb.getSelectedObjects();
            // data source parameters are not shown in case multiple objects are selected
            let selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;

            this.rb.getPopupWindow().show(
                this.rb.getParameterItems(selectedObject, null), null,
                'rbro_doc_element_print_if', 'printIf', PopupWindow.type.parameterAppend);
        });
        elSplit.append(elParameterButton);
        elFormField.append(elSplit);
        elFormField.append(
            utils.createElement('div', { id: 'rbro_doc_element_print_if_error', class: 'rbroErrorMessage' })
        );
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_repeat_header_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementRepeatHeader'), 'rbro_doc_element_repeat_header');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elRepeatHeader = utils.createElement('input', { id: 'rbro_doc_element_repeat_header', type: 'checkbox' });
        elRepeatHeader.addEventListener('change', (event) => {
            let repeatHeaderChecked = elRepeatHeader.checked;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'repeatHeader', repeatHeaderChecked,
                    SetValueCmd.type.checkbox, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(elRepeatHeader);
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_remove_empty_element_row', class: 'rbroFormRow' });
        utils.appendLabel(
            elDiv, this.rb.getLabel('docElementRemoveEmptyElement'), 'rbro_doc_element_remove_empty_element');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elRemoveEmptyElement = utils.createElement(
            'input', { id: 'rbro_doc_element_remove_empty_element', type: 'checkbox' });
        elRemoveEmptyElement.addEventListener('change', (event) => {
            let removeEmptyElementChecked = elRemoveEmptyElement.checked;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'removeEmptyElement', removeEmptyElementChecked,
                    SetValueCmd.type.checkbox, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(elRemoveEmptyElement);
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = utils.createElement(
            'div', { id: 'rbro_doc_element_always_print_on_same_page_row', class: 'rbroFormRow' });
        utils.appendLabel(
            elDiv, this.rb.getLabel('docElementAlwaysPrintOnSamePage'), 'rbro_doc_element_always_print_on_same_page');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elAlwaysPrintOnSamePage = utils.createElement(
            'input', { id: 'rbro_doc_element_always_print_on_same_page', type: 'checkbox' });
        elAlwaysPrintOnSamePage.addEventListener('change', (event) => {
            let alwaysPrintOnSamePageChecked = elAlwaysPrintOnSamePage.checked;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'alwaysPrintOnSamePage', alwaysPrintOnSamePageChecked,
                    SetValueCmd.type.checkbox, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(elAlwaysPrintOnSamePage);
        elFormField.append(
            utils.createElement(
                'div', { id: 'rbro_doc_element_always_print_on_same_page_error', class: 'rbroErrorMessage' })
        );
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = utils.createElement(
            'div', { id: 'rbro_doc_element_shrink_to_content_height_row', class: 'rbroFormRow' });
        utils.appendLabel(
            elDiv, this.rb.getLabel('docElementShrinkToContentHeight'), 'rbro_doc_element_shrink_to_content_height');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elShrinkToContentHeight = utils.createElement(
            'input', { id: 'rbro_doc_element_shrink_to_content_height', type: 'checkbox' });
        elShrinkToContentHeight.addEventListener('change', (event) => {
            let shrinkToContentHeightChecked = elShrinkToContentHeight.checked;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'shrinkToContentHeight', shrinkToContentHeightChecked,
                    SetValueCmd.type.checkbox, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(elShrinkToContentHeight);
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = utils.createElement(
            'div', { id: 'rbro_doc_element_align_to_page_bottom_row', class: 'rbroFormRow' });
        utils.appendLabel(
            elDiv, this.rb.getLabel('docElementAlignToPageBottom'), 'rbro_doc_element_align_to_page_bottom');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elAlignToPageBottom = utils.createElement(
            'input', { id: 'rbro_doc_element_align_to_page_bottom', type: 'checkbox' });
        elAlignToPageBottom.addEventListener('change', (event) => {
            let alignToPageBottomChecked = elAlignToPageBottom.checked;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'alignToPageBottom', alignToPageBottomChecked,
                    SetValueCmd.type.checkbox, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(elAlignToPageBottom);
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_pattern_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementPattern'), 'rbro_doc_element_pattern');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        elSplit = utils.createElement('div', { class: 'rbroSplit rbroSelector' });
        let elPattern = utils.createElement('input', { id: 'rbro_doc_element_pattern', autocomplete: 'off' });
        elPattern.addEventListener('input', (event) => {
            let val = elPattern.value;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'pattern', val, SetValueCmd.type.text, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elSplit.append(elPattern);
        elParameterButton = utils.createElement('div', { class: 'rbroButton rbroRoundButton rbroIcon-select' });
        elParameterButton.addEventListener('click', (event) => {
            this.rb.getPopupWindow().show(
                this.rb.getPatterns(), null, 'rbro_doc_element_pattern', 'pattern', PopupWindow.type.pattern);
        });
        elSplit.append(elParameterButton);
        elFormField.append(elSplit);
        elFormField.append(
            utils.createElement('div', { id: 'rbro_doc_element_pattern_error', class: 'rbroErrorMessage' })
        );
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_link_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementLink'), 'rbro_doc_element_link');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        elSplit = utils.createElement('div', { class: 'rbroSplit rbroSelector' });
        let elLink = utils.createElement('input', { id: 'rbro_doc_element_link', autocomplete: 'off' });
        elLink.addEventListener('input', (event) => {
            let val = elLink.value;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'link', val, SetValueCmd.type.text, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elSplit.append(elLink);
        elParameterButton = utils.createElement('div', { class: 'rbroButton rbroRoundButton rbroIcon-select' });
        elParameterButton.addEventListener('click', (event) => {
            let selectedObjects = this.rb.getSelectedObjects();
            // data source parameters are not shown in case multiple objects are selected
            let selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;

            this.rb.getPopupWindow().show(
                this.rb.getParameterItems(selectedObject, null), null,
                'rbro_doc_element_link', 'link', PopupWindow.type.parameterSet);
        });
        elSplit.append(elParameterButton);
        elFormField.append(elSplit);
        elFormField.append(
            utils.createElement('div', { id: 'rbro_doc_element_link_error', class: 'rbroErrorMessage' })
        );
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_grow_weight_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementGrowWeight'), 'rbro_doc_element_grow_weight');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elGrowWeight = utils.createElement('select', { id: 'rbro_doc_element_grow_weight' });
        elGrowWeight.append(utils.createElement('option', { value: '0' }, '-'));
        elGrowWeight.append(utils.createElement(
            'option', { value: '1' }, `1 (${this.rb.getLabel('docElementGrowWeightLow')})`));
        elGrowWeight.append(utils.createElement('option', { value: '2' }, '2'));
        elGrowWeight.append(utils.createElement(
            'option', { value: '3' }, `3 (${this.rb.getLabel('docElementGrowWeightHigh')})`));
        elGrowWeight.addEventListener('change', (event) => {
            let val = elGrowWeight.value;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'growWeight', val, SetValueCmd.type.select, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(elGrowWeight);
        elFormField.append(
            utils.createElement('div', { class: 'rbroInfo'}, this.rb.getLabel('docElementGrowWeightInfo')));
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
        let elCsStyleSectionContainer = utils.createElement(
            'div', { id: 'rbro_doc_element_cs_style_section_container' });
        let elCsStyleHeader = utils.createElement('div', { class: 'rbroPanelSectionHeader' });
        let elCsStyleHeaderIcon = utils.createElement(
            'span', { id: 'rbro_doc_element_cs_style_header_icon', class: 'rbroIcon-plus' });
        elDiv = utils.createElement(
            'div', { id: 'rbro_doc_element_cs_style_header', class: 'rbroFormRow rbroPanelSection' });
        elDiv.addEventListener('click', (event) => {
            document.getElementById('rbro_doc_element_cs_style_header').classList.toggle('rbroPanelSectionHeaderOpen');
            document.getElementById('rbro_doc_element_cs_style_section').classList.toggle('rbroHidden');
            elCsStyleHeaderIcon.classList.toggle('rbroIcon-plus');
            elCsStyleHeaderIcon.classList.toggle('rbroIcon-minus');
            if (elCsStyleHeaderIcon.classList.contains('rbroIcon-minus')) {
                const sectionOffset = document.getElementById('rbro_doc_element_cs_style_section_container').offsetTop;
                document.getElementById('rbro_detail_panel').scrollTop = sectionOffset;
            }
        });
        elCsStyleHeader.append(elCsStyleHeaderIcon);
        elCsStyleHeader.append(utils.createElement('span', {}, this.rb.getLabel('docElementConditionalStyle')));
        elDiv.append(elCsStyleHeader);
        elCsStyleSectionContainer.append(elDiv);

        let elCsStyleSectionDiv = utils.createElement(
            'div', { id: 'rbro_doc_element_cs_style_section', class: 'rbroHidden' });

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_cs_condition_row', class: 'rbroFormRow' });
        utils.appendLabel(
            elDiv, this.rb.getLabel('docElementConditionalStyleCondition'), 'rbro_doc_element_cs_condition');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        elSplit = utils.createElement('div', { class: 'rbroSplit rbroSelector' });
        let elCondStyleCondition = utils.createElement('textarea', { id: 'rbro_doc_element_cs_condition', rows: 1 });
        elCondStyleCondition.addEventListener('input', (event) => {
            let val = elCondStyleCondition.value;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'cs_condition', val, SetValueCmd.type.text, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        autosize(elCondStyleCondition);
        elSplit.append(elCondStyleCondition);
        elParameterButton = utils.createElement('div', { class: 'rbroButton rbroRoundButton rbroIcon-select' });
        elParameterButton.addEventListener('click', (event) => {
            let selectedObjects = this.rb.getSelectedObjects();
            // data source parameters are not shown in case multiple objects are selected
            let selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;

            this.rb.getPopupWindow().show(
                this.rb.getParameterItems(selectedObject, null), null,
                'rbro_doc_element_cs_condition', 'cs_condition', PopupWindow.type.parameterAppend);
        });
        elSplit.append(elParameterButton);
        elFormField.append(elSplit);
        elFormField.append(
            utils.createElement('div', { id: 'rbro_doc_element_cs_condition_error', class: 'rbroErrorMessage' })
        );
        elDiv.append(elFormField);
        elCsStyleSectionDiv.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_cs_style_id_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementStyle'), 'rbro_doc_element_cs_style_id');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        this.elCsStyle = utils.createElement('select', { id: 'rbro_doc_element_cs_style_id' });
        this.elCsStyle.addEventListener('change', (event) => {
            let val = this.elCsStyle.value;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                obj.addCommandsForChangedStyle(
                    val, 'cs_', this.propertyDescriptors, cmdGroup);
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(this.elCsStyle);
        elDiv.append(elFormField);
        elCsStyleSectionDiv.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_cs_additional_rules_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementAdditionalRules'));
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elEditAdditionalRulesButton = utils.createElement(
            'button', {
                id: 'rbro_doc_element_cs_additional_rules',
                class: 'rbroButton rbroActionButton'
            });
        elEditAdditionalRulesButton.append(utils.createElement('span', {}, this.rb.getLabel('editData')));
        elEditAdditionalRulesButton.append(utils.createElement('span', { class: 'rbroIcon-edit' }));
        elEditAdditionalRulesButton.addEventListener('click', (event) => {
            const selectedObjects = this.rb.getSelectedObjects();
            if (selectedObjects.length === 1) {
                const selectedObject = selectedObjects[0];
                const fields = [
                    {
                        name: 'condition', label: this.rb.getLabel('docElementConditionalStyleCondition'),
                        type: Parameter.type.string, parameter: null,
                        attributes: { multiLine: true },
                    },
                    {
                        name: 'style_id', label: this.rb.getLabel('docElementStyle'),
                        type: Parameter.type.string, parameter: null,
                        attributes: { select: 'style' },
                    },
                ];
                let data = [];
                if (selectedObject.getValue('cs_additionalRules')) {
                    try {
                        data = JSON.parse(selectedObject.getValue('cs_additionalRules'));
                    } catch (e) {
                    }
                }
                this.rb.getPopupWindow().show(
                    null, selectedObject.getId(), '', 'cs_additionalRules', PopupWindow.type.data, null, null,
                    Parameter.type.array, fields, data);
            } else if (selectedObjects.length > 1) {
                alert(this.rb.getLabel('docElementEditMultipleSelectionNotSupported'));
            }
        });
        elFormField.append(elEditAdditionalRulesButton);
        elFormField.append(
            utils.createElement(
                'div', { id: 'rbro_doc_element_cs_additional_rules_error', class: 'rbroErrorMessage' }));
        elDiv.append(elFormField);
        elCsStyleSectionDiv.append(elDiv);

        let elCsStyleDiv = utils.createElement('div', { id: 'rbro_doc_element_cs_style_settings' });
        StylePanel.renderStyle(elCsStyleDiv, 'doc_element_cs_', 'cs_', false, this.controls, this.rb);
        elCsStyleSectionDiv.append(elCsStyleDiv);
        elCsStyleSectionContainer.append(elCsStyleSectionDiv);
        panel.append(elCsStyleSectionContainer);
        // -------------------------------------
        // --- Conditional Style Section End ---
        // -------------------------------------

        // ---------------------------------
        // --- Spreadsheet Section Begin ---
        // ---------------------------------
        let elSpreadsheetSectionContainer = utils.createElement(
            'div', { id: 'rbro_doc_element_spreadsheet_section_container' });
        let elSpreadsheetHeader = utils.createElement('div', { class: 'rbroPanelSectionHeader' });
        let elSpreadsheetHeaderIcon = utils.createElement(
            'span', { id: 'rbro_doc_element_spreadsheet_header_icon', class: 'rbroIcon-plus' });
        elDiv = utils.createElement(
            'div', { id: 'rbro_doc_element_spreadsheet_header', class: 'rbroFormRow rbroPanelSection' });
        elDiv.addEventListener('click', (event) => {
            document.getElementById('rbro_doc_element_spreadsheet_header').classList.toggle(
                'rbroPanelSectionHeaderOpen');
            document.getElementById('rbro_doc_element_spreadsheet_section').classList.toggle('rbroHidden');
            elSpreadsheetHeaderIcon.classList.toggle('rbroIcon-plus');
            elSpreadsheetHeaderIcon.classList.toggle('rbroIcon-minus');
            if (elSpreadsheetHeaderIcon.classList.contains('rbroIcon-minus')) {
                const sectionOffset =
                    document.getElementById('rbro_doc_element_spreadsheet_section_container').offsetTop;
                document.getElementById('rbro_detail_panel').scrollTop = sectionOffset;
            }
        });
        elSpreadsheetHeader.append(elSpreadsheetHeaderIcon);
        elSpreadsheetHeader.append(utils.createElement('span', {}, this.rb.getLabel('docElementSpreadsheet')));
        elDiv.append(elSpreadsheetHeader);
        elSpreadsheetSectionContainer.append(elDiv);

        let elSpreadsheetSectionDiv = utils.createElement(
            'div', { id: 'rbro_doc_element_spreadsheet_section', class: 'rbroHidden' });
        elDiv = utils.createElement('div', { id: 'rbro_doc_element_spreadsheet_hide_row', class: 'rbroFormRow' });
        utils.appendLabel(
            elDiv, this.rb.getLabel('docElementSpreadsheetHide'), 'rbro_doc_element_spreadsheet_hide');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elSpreadsheetHide = utils.createElement(
            'input', { id: 'rbro_doc_element_spreadsheet_hide', type: 'checkbox' });
        elSpreadsheetHide.addEventListener('change', (event) => {
            let spreadsheetHideChecked = elSpreadsheetHide.checked;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'spreadsheet_hide', spreadsheetHideChecked,
                    SetValueCmd.type.checkbox, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(elSpreadsheetHide);
        elDiv.append(elFormField);
        elSpreadsheetSectionDiv.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_spreadsheet_column_row', class: 'rbroFormRow' });
        utils.appendLabel(
            elDiv, this.rb.getLabel('docElementSpreadsheetColumn'), 'rbro_doc_element_spreadsheet_column');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elSpreadsheetColumn = utils.createElement(
            'input', { id: 'rbro_doc_element_spreadsheet_column', type: 'number', autocomplete: 'off' });
        elSpreadsheetColumn.addEventListener('input', (event) => {
            let val = elSpreadsheetColumn.value;
            if (val !== '') {
                val = utils.checkInputDecimal(val, 1, 99);
            }
            if (val !== elSpreadsheetColumn.value) {
                elSpreadsheetColumn.value = val;
            }
            let selectedObjects = this.rb.getSelectedObjects();
            let valueChanged = false;
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                if (selectedObjects[i].getValue('spreadsheet_column') !== val) {
                    valueChanged = true;
                    break;
                }
            }

            if (valueChanged) {
                let cmdGroup = new CommandGroupCmd('Set value', this.rb);
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), 'spreadsheet_column', val,
                        SetValueCmd.type.text, this.rb));
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            }
        });
        elFormField.append(elSpreadsheetColumn);
        elFormField.append(
            utils.createElement(
                'div', { id: 'rbro_doc_element_spreadsheet_column_error', class: 'rbroErrorMessage' })
        );
        elDiv.append(elFormField);
        elSpreadsheetSectionDiv.append(elDiv);

        elDiv = utils.createElement(
            'div', { id: 'rbro_doc_element_spreadsheet_colspan_row', class: 'rbroFormRow' });
        utils.appendLabel(
            elDiv, this.rb.getLabel('docElementSpreadsheetColspan'), 'rbro_doc_element_spreadsheet_colspan');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elSpreadsheetColspan = utils.createElement(
            'input', { id: 'rbro_doc_element_spreadsheet_colspan', type: 'number', autocomplete: 'off' });
        elSpreadsheetColspan.addEventListener('input', (event) => {
                let val = elSpreadsheetColspan.value;
                let cmdGroup = new CommandGroupCmd('Set value', this.rb);
                let selectedObjects = this.rb.getSelectedObjects();
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(), 'spreadsheet_colspan', val,
                        SetValueCmd.type.text, this.rb));
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            });
        elFormField.append(elSpreadsheetColspan);
        elFormField.append(
            utils.createElement(
                'div', { id: 'rbro_doc_element_spreadsheet_colspan_error', class: 'rbroErrorMessage' })
        );
        elDiv.append(elFormField);
        elSpreadsheetSectionDiv.append(elDiv);

        elDiv = utils.createElement(
            'div', { id: 'rbro_doc_element_spreadsheet_add_empty_row_row', class: 'rbroFormRow' });
        utils.appendLabel(
            elDiv, this.rb.getLabel('docElementSpreadsheetAddEmptyRow'),
            'rbro_doc_element_spreadsheet_add_empty_row');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elSpreadsheetAddEmptyRow = utils.createElement(
            'input', { id: 'rbro_doc_element_spreadsheet_add_empty_row', type: 'checkbox' });
        elSpreadsheetAddEmptyRow.addEventListener('change', (event) => {
            let spreadsheetAddEmptyRowChecked = elSpreadsheetAddEmptyRow.checked;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'spreadsheet_addEmptyRow',
                    spreadsheetAddEmptyRowChecked, SetValueCmd.type.checkbox, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(elSpreadsheetAddEmptyRow);
        elDiv.append(elFormField);
        elSpreadsheetSectionDiv.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_spreadsheet_type_row', class: 'rbroFormRow' });
        utils.appendLabel(elDiv, this.rb.getLabel('docElementSpreadsheetType'), 'rbro_doc_element_spreadsheet_type');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elSpreadsheetType = utils.createElement('select', { id: 'rbro_doc_element_spreadsheet_type' });
        elSpreadsheetType.append(
            utils.createElement('option', { value: '' }, this.rb.getLabel('docElementSpreadsheetTypeNone')));
        elSpreadsheetType.append(
            utils.createElement('option', { value: 'number' }, this.rb.getLabel('docElementSpreadsheetTypeNumber')));
        elSpreadsheetType.append(
            utils.createElement('option', { value: 'date' }, this.rb.getLabel('docElementSpreadsheetTypeDate')));
        elSpreadsheetType.addEventListener('change', (event) => {
            let val = elSpreadsheetType.value;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'spreadsheet_type', val, SetValueCmd.type.text, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(elSpreadsheetType);
        elFormField.append(utils.createElement(
          'div', { id: 'rbro_doc_element_spreadsheet_type_error', class: 'rbroErrorMessage' }));
        elDiv.append(elFormField);
        elSpreadsheetSectionDiv.append(elDiv);

        elDiv = utils.createElement('div', { id: 'rbro_doc_element_spreadsheet_pattern_row', class: 'rbroFormRow' });
        utils.appendLabel(
          elDiv, this.rb.getLabel('docElementSpreadsheetPattern'), 'rbro_doc_element_spreadsheet_pattern');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        elSplit = utils.createElement('div', { class: 'rbroSplit rbroSelector' });
        let elSpreadsheetPattern = utils.createElement(
          'input', { id: 'rbro_doc_element_spreadsheet_pattern', autocomplete: 'off' });
        elSpreadsheetPattern.addEventListener('input', (event) => {
            let val = elSpreadsheetPattern.value;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'spreadsheet_pattern', val, SetValueCmd.type.text, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elSplit.append(elSpreadsheetPattern);
        elParameterButton = utils.createElement('div', { class: 'rbroButton rbroRoundButton rbroIcon-select' });
        elParameterButton.addEventListener('click', (event) => {
            let patterns;
            if (elSpreadsheetType.value === 'date') {
                patterns = this.rb.getProperty('patternDates');
            } else if (elSpreadsheetType.value === 'number') {
                patterns = this.rb.getProperty('patternNumbers');
            } else {
                patterns = this.rb.getPatterns();
            }

            this.rb.getPopupWindow().show(
                patterns, null, 'rbro_doc_element_spreadsheet_pattern', 'spreadsheet_pattern',
                PopupWindow.type.pattern);
        });
        elSplit.append(elParameterButton);
        elFormField.append(elSplit);
        elFormField.append(
            utils.createElement('div', { id: 'rbro_doc_element_spreadsheet_pattern_error', class: 'rbroErrorMessage' })
        );
        elDiv.append(elFormField);
        elSpreadsheetSectionDiv.append(elDiv);

        elDiv = utils.createElement(
            'div', { id: 'rbro_doc_element_spreadsheet_text_wrap_row', class: 'rbroFormRow' });
        utils.appendLabel(
            elDiv, this.rb.getLabel('docElementSpreadsheetTextWrap'), 'rbro_doc_element_spreadsheet_text_wrap');
        elFormField = utils.createElement('div', { class: 'rbroFormField' });
        let elSpreadsheetTextWrap = utils.createElement(
            'input', { id: 'rbro_doc_element_spreadsheet_text_wrap', type: 'checkbox' });
        elSpreadsheetTextWrap.addEventListener('change', (event) => {
            let spreadsheetTextWrapChecked = elSpreadsheetTextWrap.checked;
            let cmdGroup = new CommandGroupCmd('Set value', this.rb);
            let selectedObjects = this.rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'spreadsheet_textWrap',
                    spreadsheetTextWrapChecked, SetValueCmd.type.checkbox, this.rb));
            }
            if (!cmdGroup.isEmpty()) {
                this.rb.executeCommand(cmdGroup);
            }
        });
        elFormField.append(elSpreadsheetTextWrap);
        elDiv.append(elFormField);
        elSpreadsheetSectionDiv.append(elDiv);

        elSpreadsheetSectionContainer.append(elSpreadsheetSectionDiv);
        if (!this.rb.getProperty('enableSpreadsheet')) {
            elSpreadsheetSectionContainer.style.display = 'none';
        }
        panel.append(elSpreadsheetSectionContainer);
        // -------------------------------
        // --- Spreadsheet Section End ---
        // -------------------------------

        document.getElementById('rbro_detail_panel').append(panel);

        if (this.rb.getProperty('showPlusFeatures')) {
            this.setupRichText();
        }
    }

    renderStyleSelect() {
        let styleType = '';
        const selectedObjects = this.rb.getSelectedObjects();
        if (selectedObjects.length > 0) {
            styleType = DocElementPanel.getElementStyleType(selectedObjects[0]);
            for (const selectedObject of this.rb.getSelectedObjects()) {
                if (styleType !== DocElementPanel.getElementStyleType(selectedObject)) {
                    styleType = 'mixed';
                    break;
                }
            }
        }

        utils.populateStyleSelect(this.elStyle, styleType, null, this.rb);
        utils.populateStyleSelect(this.elCsStyle, styleType, null, this.rb);
    }

    setupRichText() {
        // add protocol to link if not present, by default quill discards the link if there is not protocol
        let Link = Quill.import('formats/link');
        let sanitizeLinkSuper = Link.sanitize;
        Link.sanitize = function customSanitizeLinkInput(linkValueInput) {
            let val = linkValueInput;
            if (/^\w+:/.test(val) || val.startsWith('${')) {
                // do nothing, user is already using a custom protocol or a parameter value
                return val;
            } else if (!/^https?:/.test(val)) {
                // add missing http protocol to url
                if (val.startsWith('/')) {
                    val = "http:" + val;
                } else {
                    val = "http://" + val;
                }
            }
            return sanitizeLinkSuper.call(this, val);
        };

        document.getElementById('rbro_doc_element_rich_text_content_toolbar_parameter')
            .addEventListener('click', (event) => {
                let selectedObjects = this.rb.getSelectedObjects();
                // data source parameters are not shown in case multiple objects are selected
                let selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;

                this.rb.getPopupWindow().show(
                    this.rb.getParameterItems(selectedObject, null), null,
                    'rbro_doc_element_rich_text_content', 'richTextContent',
                    PopupWindow.type.parameterAppend, this.quill);
            });

        let fontFormat = Quill.import('formats/font');
        let richTextFonts = [];
        for (let font of this.rb.getFonts()) {
            richTextFonts.push(font.value);
        }
        fontFormat.whitelist = richTextFonts;
        Quill.register(fontFormat, true);

        let fontSizeStyle = Quill.import('attributors/style/size');
        let fontSizes = this.rb.getProperty('fontSizes');
        let richTextFontSize = [];
        for (let fontSize of fontSizes) {
            richTextFontSize.push(fontSize + 'px');
        }
        fontSizeStyle.whitelist = richTextFontSize;
        Quill.register(fontSizeStyle, true);

        let quill = new Quill('#rbro_doc_element_rich_text_content', {
            modules: {
                toolbar: '#rbro_doc_element_rich_text_content_toolbar'
            },
            placeholder: '',
            theme: 'snow'  // or 'bubble'
        });

        // handle additional "color" to clear current color format
        quill.getModule('toolbar').addHandler('color', (value) => {
            if (value === 'clear-color') {
                quill.format('color', '');
            } else {
                quill.format('color', value);
            }
        });
        quill.getModule('toolbar').addHandler('background', (value) => {
            if (value === 'clear-color') {
                quill.format('background', '');
            } else {
                quill.format('background', value);
            }
        });

        let rb = this.rb;
        quill.on('text-change', function(delta, oldDelta, source) {
            let content = quill.getContents();
            let html = quill.root.innerHTML;
            let cmdGroup = new CommandGroupCmd('Set value', rb);
            let selectedObjects = rb.getSelectedObjects();
            for (let i=selectedObjects.length - 1; i >= 0; i--) {
                let obj = selectedObjects[i];
                cmdGroup.addSelection(obj.getId());
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'richTextContent', content, SetValueCmd.type.richText, rb));
                cmdGroup.addCommand(new SetValueCmd(
                    obj.getId(), 'richTextHtml', html, SetValueCmd.type.text, rb));
            }
            if (!cmdGroup.isEmpty()) {
                rb.executeCommand(cmdGroup);
            }
        });
        this.quill = quill;
    }

    /**
     * Is called when the ReportBro instance is deleted and should be used
     * to cleanup elements and event handlers.
     */
    destroy() {
        this.controls['color'].destroy();
        StylePanel.destroyStyle('', this.controls);
        StylePanel.destroyStyle('cs_', this.controls);
    }

    /**
     * Update size of all autosize textareas in panel.
     * @param {?String} field - affected field in case of change operation.
     */
    updateAutosizeInputs(field) {
        if (field === null || field === 'dataSource') {
            autosize.update(document.getElementById('rbro_doc_element_data_source'));
        }
        if (field === null || field === 'content') {
            autosize.update(document.getElementById('rbro_doc_element_content'));
        }
        if (field === null || field === 'source') {
            autosize.update(document.getElementById('rbro_doc_element_source'));
        }
        if (field === null || field === 'groupExpression') {
            autosize.update(document.getElementById('rbro_doc_element_group_expression'));
        }
        if (field === null || field === 'printIf') {
            autosize.update(document.getElementById('rbro_doc_element_print_if'));
        }
        if (field === null || field === 'cs_condition') {
            autosize.update(document.getElementById('rbro_doc_element_cs_condition'));
        }
    }

    show() {
        super.show();
    }

    /**
     * Is called when a data object was modified (including new and deleted data objects).
     * @param {*} obj - new/deleted/modified data object.
     * @param {String} operation - operation which caused the notification.
     * @param {String} [field] - affected field in case of change operation.
     */
    notifyEvent(obj, operation, field) {
        if (obj instanceof Style) {
            if (operation === Command.operation.add || operation === Command.operation.remove ||
                    operation === Command.operation.move ||
                    (operation === Command.operation.change && field === 'name')) {
                this.renderStyleSelect();
            }
        } else {
            super.notifyEvent(obj, operation, field);
        }
    }

    /**
     * Is called when the selected element was changed.
     */
    selectionChanged() {
        // render style selects before values are set (in super.selectionChanged), otherwise selection gets lost
        this.renderStyleSelect();
        super.selectionChanged();
    }

    /**
     * Return available sections in the property panel.
     * @returns {[String]}
     */
    getSections() {
        return ['style', 'print', 'cs_style', 'spreadsheet'];
    }

    /**
     * Return style type for given element (needed for rendering of style select) or empty string if
     * element does not have a style.
     * @param {DocElement} element - doc element
     * @return {string} style type
     */
    static getElementStyleType(element) {
        if (element instanceof TextElement || element instanceof TableTextElement) {
            return Style.type.text;
        } else if (element instanceof LineElement) {
            return Style.type.line;
        } else if (element instanceof ImageElement) {
            return Style.type.image;
        } else if (element instanceof TableElement) {
            return Style.type.table;
        } else if (element instanceof TableBandElement) {
            return Style.type.tableBand;
        } else if (element instanceof FrameElement) {
            return Style.type.frame;
        } else if (element instanceof SectionBandElement) {
            return Style.type.sectionBand;
        }
        return '';
    }
}
