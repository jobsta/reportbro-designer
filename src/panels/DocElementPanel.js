import PanelBase from './PanelBase';
import StylePanel from './StylePanel';
import Command from '../commands/Command';
import CommandGroupCmd from '../commands/CommandGroupCmd';
import SetValueCmd from '../commands/SetValueCmd';
import Parameter from '../data/Parameter';
import Style from '../data/Style';
import DocElement from '../elements/DocElement';
import PopupWindow from '../PopupWindow';
import * as utils from '../utils';
import Quill from 'quill';
import Delta from 'quill-delta';
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
                'fieldId': 'rich_text'
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
                'singlePropertyLabel': 'docElementWidth'
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
                'visibleIf': 'format==CODE128'
            },
            'errorCorrectionLevel': {
                'type': SetValueCmd.type.select,
                'fieldId': 'error_correction_level',
                'visibleIf': 'format==QRCode'
            },
            'source': {
                'type': SetValueCmd.type.text,
                'fieldId': 'source'
            },
            'image': {
                'type': SetValueCmd.type.file,
                'fieldId': 'image',
                'rowId': 'rbro_doc_element_image_row',
                'singleRowProperty': false,
                'rowProperties': ['image', 'imageFilename']
            },
            'imageFilename': {
                'type': SetValueCmd.type.filename,
                'fieldId': 'image_filename',
                'rowId': 'rbro_doc_element_image_row',
                'singleRowProperty': false
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
            'color': {
                'type': SetValueCmd.type.color,
                'allowEmpty': false,
                'fieldId': 'color',
                'section': 'style'
            },
            'styleId': {
                'type': SetValueCmd.type.select,
                'fieldId': 'style_id',
                'section': 'style',
                'allowEmpty': true
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
            'spreadsheet_textWrap': {
                'type': SetValueCmd.type.checkbox,
                'fieldId': 'spreadsheet_text_wrap',
                'section': 'spreadsheet'
            }
        };

        // collect all fields which are referenced in the visibleIf property
        this.visibleIfFields = [];
        for (let property in this.propertyDescriptors) {
            if (this.propertyDescriptors.hasOwnProperty(property)) {
                let propertyDescriptor = this.propertyDescriptors[property];
                if ('visibleIf' in propertyDescriptor) {
                    let visibleIfField = propertyDescriptor['visibleIf'];
                    if (visibleIfField.substr(0, 1) === '!') {
                        visibleIfField = visibleIfField.substr(1);
                    }
                    if (!this.visibleIfFields.includes(visibleIfField)) {
                        this.visibleIfFields.push(visibleIfField);
                    }
                }
            }
        }
    }

    render() {
        let elDiv, elFormField, elParameterButton;
        let panel = $('<div id="rbro_doc_element_panel" class="rbroHidden"></div>');

        elDiv = $('<div id="rbro_doc_element_label_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_label">${this.rb.getLabel('docElementLabel')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elLabel = $('<input id="rbro_doc_element_label">')
            .on('input', event => {
                let val = elLabel.val();
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

        elDiv = $('<div id="rbro_doc_element_data_source_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_data_source">
                      ${this.rb.getLabel('docElementDataSource')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elDataSource = $('<textarea id="rbro_doc_element_data_source" rows="1"></textarea>')
            .on('input', event => {
                let val = elDataSource.val();
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
        elFormField.append(elDataSource);
        elParameterButton = $('<div class="rbroButton rbroRoundButton rbroIcon-select"></div>')
            .click(event => {
                let selectedObjects = this.rb.getSelectedObjects();
                // data source parameters are not shown in case multiple objects are selected
                let selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;

                this.rb.getPopupWindow().show(
                    this.rb.getParameterItems(selectedObject, [Parameter.type.array]),
                    null, 'rbro_doc_element_data_source', 'dataSource', PopupWindow.type.parameterSet);
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_doc_element_data_source_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_content_row" class="rbroFormRow rbroHidden"></div>');
        elDiv.append(`<label for="rbro_doc_element_content">${this.rb.getLabel('docElementContent')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elContent = $(`<textarea id="rbro_doc_element_content" rows="1"></textarea>`)
            .on('input', event => {
                let val = elContent.val();
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

        // Rich-Text-Editor
        if (this.rb.getProperty('showPlusFeatures')) {
            elDiv = $('<div id="rbro_doc_element_rich_text_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_doc_element_rich_text">${this.rb.getLabel('docElementRichText')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elRichTextLabel = $('<label class="switch-light switch-material"></label>');
            let elRichText = $('<input id="rbro_doc_element_rich_text" type="checkbox">')
                .change(event => {
                    let richTextChecked = elRichText.is(":checked");
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
            let elRichTextSpan = $('<span></span>');
            elRichTextSpan.append($('<span></span>'));
            elRichTextSpan.append($('<span></span>'));
            elRichTextSpan.append($('<a></a>'));
            elRichTextLabel.append(elRichTextSpan);
            elFormField.append(elRichTextLabel);
            elFormField.append('<div id="rbro_doc_element_rich_text_error" class="rbroErrorMessage"></div>');
            if (this.rb.getProperty('showPlusFeaturesInfo')) {
                elFormField.append(`<div class="rbroInfo">${this.rb.getLabel('plusFeatureInfo')}</div>`);
            }
            elDiv.append(elFormField);
            panel.append(elDiv);

            elDiv = $('<div id="rbro_doc_element_rich_text_content_row" class="rbroFormRow rbroRichTextEditor rbroHidden"></div>');

            let colors = this.rb.getProperty('colors');
            let strRichTextColor = `<select class="ql-color" title="${this.rb.getLabel('styleTextColor')}">`;
            let strRichTextBackgroundColor = `<select class="ql-background" title="${this.rb.getLabel('styleBackgroundColor')}">`;
            for (let color of colors) {
                strRichTextColor += `<option value="${color}">${color}</option>`;
                strRichTextBackgroundColor += `<option value="${color}">${color}</option>`;
            }
            strRichTextColor += '<option value="clear-color"></option>';
            strRichTextColor += '</select>';
            strRichTextBackgroundColor += '<option value="clear-color"></option>';
            strRichTextBackgroundColor += '</select>';

            let strRichTextFont = '<select class="ql-font">';
            let defaultFont = this.rb.getProperty('defaultFont');
            for (let font of this.rb.getFonts()) {
                strRichTextFont += `<option value="${font.value}" ${font.value === defaultFont ? 'selected="selected"' : ''}>${font.name}</option>`;
            }
            strRichTextFont += '</select>';
            let strRichTextFontSize = '<select class="ql-size">';
            for (let size of this.rb.getProperty('fontSizes')) {
                strRichTextFontSize += `<option value="${size}px" ${size === 12 ? 'selected="selected"' : ''}>${size}pt</option>`;
            }
            strRichTextFontSize += '</select>';

            elDiv.append(`
                <div id="rbro_doc_element_rich_text_content_toolbar">
                    <span class="ql-formats">
                        <button class="ql-bold" title="${this.rb.getLabel('styleBold')}"></button>
                        <button class="ql-italic" title="${this.rb.getLabel('styleItalic')}"></button>
                        <button class="ql-underline" title="${this.rb.getLabel('styleUnderline')}"></button>
                        <button class="ql-strike" title="${this.rb.getLabel('styleStrikethrough')}"></button>
                    </span>
                    <span class="ql-formats">
                        <button class="ql-link"></button>
                    </span>
                    <span class="ql-formats">
                        <select class="ql-align" title="${this.rb.getLabel('styleAlignment')}"></select>
                    </span>                    
                    <span class="ql-formats">
                        ${strRichTextColor}
                        ${strRichTextBackgroundColor}
                    </span>
                    ${strRichTextFont}
                    ${strRichTextFontSize}
                    <div id="rbro_doc_element_rich_text_content_toolbar_parameter"
                         class="rbroButton rbroRoundButton rbroIcon-select"></div>
                </div>
            `);

            let elRichTextContent = $('<div id="rbro_doc_element_rich_text_content"></div>');
            elDiv.append(elRichTextContent);
            elDiv.append('<div id="rbro_doc_element_rich_text_content_error" class="rbroErrorMessage"></div>');
            panel.append(elDiv);
        }

        elDiv = $('<div id="rbro_doc_element_eval_row" class="rbroFormRow rbroHidden"></div>');
        elDiv.append(`<label for="rbro_doc_element_eval">${this.rb.getLabel('docElementEval')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elEval = $('<input id="rbro_doc_element_eval" type="checkbox">')
            .change(event => {
                let cmdGroup = new CommandGroupCmd('Set value', this.rb);
                let selectedObjects = this.rb.getSelectedObjects();
                let evalChecked = elEval.is(":checked");
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

        elDiv = $('<div id="rbro_doc_element_format_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_format">${this.rb.getLabel('docElementFormat')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elFormat = $(`<select id="rbro_doc_element_format">
                <option value="CODE128">CODE128</option>
                <option value="QRCode">QR Code</option>
            </select>`)
            .change(event => {
                let val = elFormat.val();
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

        elDiv = $('<div id="rbro_doc_element_display_value_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_display_value">${this.rb.getLabel('docElementDisplayValue')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elDisplayValue = $('<input id="rbro_doc_element_display_value" type="checkbox">')
            .change(event => {
                let displayValueChecked = elDisplayValue.is(":checked");
                let cmdGroup = new CommandGroupCmd('Set value', this.rb);
                let selectedObjects = this.rb.getSelectedObjects();
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    cmdGroup.addCommand(new SetValueCmd(
                        obj.getId(),'displayValue', displayValueChecked,
                        SetValueCmd.type.checkbox, this.rb));
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            });
        elFormField.append(elDisplayValue);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_error_correction_level_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_error_correction_level">
                      ${this.rb.getLabel('docElementErrorCorrectionLevel')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elErrorCorrectionLevel = $(`<select id="rbro_doc_element_error_correction_level">
                <option value="L">${this.rb.getLabel('docElementErrorCorrectionLevelLow')}</option>
                <option value="M">${this.rb.getLabel('docElementErrorCorrectionLevelMedium')}</option>
                <option value="Q">${this.rb.getLabel('docElementErrorCorrectionLevelQuartile')}</option>
                <option value="H">${this.rb.getLabel('docElementErrorCorrectionLevelHigh')}</option>
            </select>`)
            .change(event => {
                let val = elErrorCorrectionLevel.val();
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

        elDiv = $('<div id="rbro_doc_element_source_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_source">${this.rb.getLabel('docElementSource')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elSource = $('<textarea id="rbro_doc_element_source" rows="1"></textarea>')
            .on('input', event => {
                let val = elSource.val();
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
        elFormField.append(elSource);
        elParameterButton = $('<div class="rbroButton rbroRoundButton rbroIcon-select"></div>')
            .click(event => {
                let selectedObjects = this.rb.getSelectedObjects();
                // data source parameters are not shown in case multiple objects are selected
                let selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;

                this.rb.getPopupWindow().show(
                    this.rb.getParameterItems(selectedObject, [Parameter.type.image, Parameter.type.string]),
                    null, 'rbro_doc_element_source', 'source', PopupWindow.type.parameterSet);
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_doc_element_source_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_image_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_image">${this.rb.getLabel('docElementImageFile')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elImage = $('<input id="rbro_doc_element_image" type="file">')
            .change(event => {
                let files = event.target.files;
                if (files && files[0]) {
                    let fileReader = new FileReader();
                    let rb = this.rb;
                    let fileName = files[0].name;
                    fileReader.onload = function(e) {
                        let cmdGroup = new CommandGroupCmd('Load image', rb);
                        let selectedObjects = rb.getSelectedObjects();
                        for (let i=selectedObjects.length - 1; i >= 0; i--) {
                            let obj = selectedObjects[i];
                            cmdGroup.addSelection(obj.getId());
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), 'image', e.target.result, SetValueCmd.type.file, rb));
                            cmdGroup.addCommand(new SetValueCmd(
                                obj.getId(), 'imageFilename', fileName, SetValueCmd.type.filename, rb));
                        }
                        if (!cmdGroup.isEmpty()) {
                            rb.executeCommand(cmdGroup);
                        }
                    };
                    fileReader.onerror = function(e) {
                        alert(rb.getLabel('docElementLoadImageErrorMsg'));
                    };
                    fileReader.readAsDataURL(files[0]);
                }
            });
        elFormField.append(elImage);
        let elFilenameDiv = $(
            '<div id="rbro_doc_element_image_filename_container" class="rbroSplit rbroHidden"></div>');
        elFilenameDiv.append($('<div id="rbro_doc_element_image_filename"></div>'));
        elFilenameDiv.append($('<div id="rbro_doc_element_image_filename_clear"' +
            '                   class="rbroIcon-cancel rbroButton rbroDeleteButton rbroRoundButton"></div>')
            .click(event => {
                elImage.val('');
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
            })
        );
        elFormField.append(elFilenameDiv);
        elFormField.append('<div id="rbro_doc_element_image_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_x_read_only_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_x_read_only" class="rbroDisabled">
                      ${this.rb.getLabel('docElementPositionX')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elXReadOnly = $('<input id="rbro_doc_element_x_read_only" disabled="true">');
        elFormField.append(elXReadOnly);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_position_row" class="rbroFormRow rbroHidden"></div>');
        elDiv.append(`<label id="rbro_doc_element_position_label" for="rbro_doc_element_x">
                      ${this.rb.getLabel('docElementPosition')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit"></div>');
        let elPosX = $('<input id="rbro_doc_element_x" type="number">')
            .on('input', event => {
                let val = elPosX.val();
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
        elFormField.append(elPosX);
        let elPosY = $('<input id="rbro_doc_element_y" type="number">')
            .on('input', event => {
                let val = elPosY.val();
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
        elFormField.append(elPosY);
        elFormField.append('<div id="rbro_doc_element_position_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_size_row" class="rbroFormRow rbroHidden"></div>');
        elDiv.append(`<label id="rbro_doc_element_size_label" for="rbro_doc_element_size">
                      ${this.rb.getLabel('docElementSize')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit"></div>');
        let elWidth = $('<input id="rbro_doc_element_width" type="number">')
            .on('input', event => {
                let val = elWidth.val();
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
        elFormField.append(elWidth);
        let elHeight = $('<input id="rbro_doc_element_height" type="number">')
            .on('input', event => {
                let val = elHeight.val();
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
        elFormField.append(elHeight);
        elFormField.append('<div id="rbro_doc_element_size_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_colspan_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_colspan">${this.rb.getLabel('docElementColspan')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elColspan = $('<input id="rbro_doc_element_colspan" type="number">')
            .change(event => {
                let val = elColspan.val().trim();
                if (val !== '') {
                    val = utils.checkInputDecimal(val, 1, 9);
                }
                if (val !== elColspan.val()) {
                    elColspan.val(val);
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
        elFormField.append('<div id="rbro_doc_element_colspan_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_columns_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_columns">${this.rb.getLabel('docElementColumns')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elColumns = $('<input id="rbro_doc_element_columns" type="number">')
            .change(event => {
                let val = utils.checkInputDecimal(elColumns.val(), 1, 99);
                if (val !== elColumns.val()) {
                    elColumns.val(val);
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
                    elColumns.val(selectedObjects[0].getValue('columns'));
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

        elDiv = $('<div id="rbro_doc_element_header_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_header">${this.rb.getLabel('header')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elHeaderLabel = $('<label class="switch-light switch-material"></label>');
        let elHeader = $('<input id="rbro_doc_element_header" type="checkbox">')
            .change(event => {
                let headerChecked = elHeader.is(":checked");
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
        let elHeaderSpan = $('<span></span>');
        elHeaderSpan.append($('<span></span>'));
        elHeaderSpan.append($('<span></span>'));
        elHeaderSpan.append($('<a></a>'));
        elHeaderLabel.append(elHeaderSpan);
        elFormField.append(elHeaderLabel);
        elDiv.append(elFormField);
        panel.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_content_rows_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_content_rows">
                      ${this.rb.getLabel('docElementContentRows')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elContentRows = $('<input id="rbro_doc_element_content_rows" type="number">')
            .change(event => {
                let val = utils.checkInputDecimal(elContentRows.val(), 1, 99);
                let contentRows = utils.convertInputToNumber(val);
                if (val !== elContentRows.val()) {
                    elContentRows.val(val);
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

        elDiv = $('<div id="rbro_doc_element_footer_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_footer">${this.rb.getLabel('footer')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elFooterLabel = $('<label class="switch-light switch-material"></label>');
        let elFooter = $('<input id="rbro_doc_element_footer" type="checkbox">')
            .change(event => {
                let footerChecked = elFooter.is(":checked");
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
        let elFooterSpan = $('<span></span>');
        elFooterSpan.append($('<span></span>'));
        elFooterSpan.append($('<span></span>'));
        elFooterSpan.append($('<a></a>'));
        elFooterLabel.append(elFooterSpan);
        elFormField.append(elFooterLabel);
        elDiv.append(elFormField);
        panel.append(elDiv);

        // ---------------------------
        // --- Style Section Begin ---
        // ---------------------------
        let elStyleSectionContainer = $('<div id="rbro_doc_element_style_section_container"></div>');
        let elStyleHeader = $('<div class="rbroPanelSectionHeader"></div>');
        let elStyleHeaderIcon = $(
            '<span id="rbro_doc_element_style_header_icon" class="rbroIcon-minus"></span>');
        elDiv = $(
            `<div id="rbro_doc_element_style_header"
             class="rbroFormRow rbroPanelSection rbroPanelSectionHeaderOpen"></div>`)
            .click(event => {
                $('#rbro_doc_element_style_header').toggleClass('rbroPanelSectionHeaderOpen');
                $('#rbro_doc_element_style_section').toggleClass('rbroHidden');
                elStyleHeaderIcon.toggleClass('rbroIcon-plus');
                elStyleHeaderIcon.toggleClass('rbroIcon-minus');
                if (elStyleHeaderIcon.hasClass('rbroIcon-minus')) {
                    let sectionOffset = document.getElementById(
                        'rbro_doc_element_style_section_container').offsetTop;
                    $('#rbro_detail_panel').scrollTop(sectionOffset);
                }
            });
        elStyleHeader.append(elStyleHeaderIcon);
        elStyleHeader.append(`<span>${this.rb.getLabel('docElementStyle')}</span>`);
        elDiv.append(elStyleHeader);
        elStyleSectionContainer.append(elDiv);

        let elStyleSectionDiv = $('<div id="rbro_doc_element_style_section"></div>');

        elDiv = $('<div id="rbro_doc_element_color_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_color">${this.rb.getLabel('docElementColor')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elColorContainer = $('<div class="rbroColorPickerContainer"></div>');
        let elColor = $('<input id="rbro_doc_element_color">')
            .change(event => {
                let val = elColor.val();
                if (utils.isValidColor(val)) {
                    let cmdGroup = new CommandGroupCmd('Set value', this.rb);
                    let selectedObjects = this.rb.getSelectedObjects();
                    for (let i=selectedObjects.length - 1; i >= 0; i--) {
                        let obj = selectedObjects[i];
                        cmdGroup.addSelection(obj.getId());
                        cmdGroup.addCommand(new SetValueCmd(
                            obj.getId(), 'color', val, SetValueCmd.type.color, this.rb));
                    }
                    if (!cmdGroup.isEmpty()) {
                        this.rb.executeCommand(cmdGroup);
                    }
                }
            });
        elColorContainer.append(elColor);
        this.controls['color'] = utils.createColorPicker(elColorContainer, elColor, false, this.rb);
        elFormField.append(elColorContainer);
        elDiv.append(elFormField);
        elStyleSectionDiv.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_style_id_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_style_id">${this.rb.getLabel('docElementStyle')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        this.elStyle = $('<select id="rbro_doc_element_style_id"></select>')
            .change(event => {
                let cmdGroup = new CommandGroupCmd('Set value', this.rb);
                let selectedObjects = this.rb.getSelectedObjects();
                for (let i=selectedObjects.length - 1; i >= 0; i--) {
                    let obj = selectedObjects[i];
                    cmdGroup.addSelection(obj.getId());
                    obj.addCommandsForChangedStyle(
                        this.elStyle.val(), '', this.propertyDescriptors, cmdGroup);
                }
                if (!cmdGroup.isEmpty()) {
                    this.rb.executeCommand(cmdGroup);
                }
            });
        elFormField.append(this.elStyle);
        elDiv.append(elFormField);
        elStyleSectionDiv.append(elDiv);

        let elStyleDiv = $('<div id="rbro_doc_element_style_settings"></div>');
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
                    let sectionOffset = document.getElementById(
                        'rbro_doc_element_print_section_container').offsetTop;
                    $('#rbro_detail_panel').scrollTop(sectionOffset);
                }
                autosize.update($('#rbro_doc_element_print_if'));
            });
        elPrintHeader.append(elPrintHeaderIcon);
        elPrintHeader.append(`<span>${this.rb.getLabel('docElementPrintSettings')}</span>`);
        elDiv.append(elPrintHeader);
        elPrintSectionContainer.append(elDiv);

        let elPrintSectionDiv = $('<div id="rbro_doc_element_print_section" class="rbroHidden"></div>');

        elDiv = $('<div id="rbro_doc_element_group_expression_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_group_expression">
                      ${this.rb.getLabel('docElementGroupExpression')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elGroupExpression = $('<textarea id="rbro_doc_element_group_expression" rows="1"></textarea>')
            .on('input', event => {
                let val = elGroupExpression.val();
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
            })
            .blur(event => {
                this.rb.getPopupWindow().hide();
            });
        autosize(elGroupExpression);
        elFormField.append(elGroupExpression);
        elParameterButton = $('<div class="rbroButton rbroRoundButton rbroIcon-select"></div>')
            .click(event => {
                let selectedObjects = this.rb.getSelectedObjects();
                // data source parameters are not shown in case multiple objects are selected
                let selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;

                this.rb.getPopupWindow().show(
                    this.rb.getParameterItems(selectedObject), null,
                    'rbro_doc_element_group_expression', 'groupExpression', PopupWindow.type.parameterSet);
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_doc_element_group_expression_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_page_break_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_page_break">
                      ${this.rb.getLabel('docElementTableBandPageBreak')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elPageBreak = $('<input id="rbro_doc_element_page_break" type="checkbox">')
            .change(event => {
                let pageBreakChecked = elPageBreak.is(":checked");
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

        elDiv = $('<div id="rbro_doc_element_repeat_group_header_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_repeat_group_header">
                      ${this.rb.getLabel('docElementRepeatGroupHeader')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elRepeatGroupHeader = $('<input id="rbro_doc_element_repeat_group_header" type="checkbox">')
            .change(event => {
                let repeatGroupHeaderChecked = elRepeatGroupHeader.is(":checked");
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
        elFormField.append('<div id="rbro_doc_element_repeat_group_header_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_print_if_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_print_if">${this.rb.getLabel('docElementPrintIf')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elPrintIf = $('<textarea id="rbro_doc_element_print_if" rows="1"></textarea>')
            .on('input', event => {
                let val = elPrintIf.val();
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

        elDiv = $('<div id="rbro_doc_element_repeat_header_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_repeat_header">
                      ${this.rb.getLabel('docElementRepeatHeader')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elRepeatHeader = $('<input id="rbro_doc_element_repeat_header" type="checkbox">')
            .change(event => {
                let repeatHeaderChecked = elRepeatHeader.is(":checked");
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

        elDiv = $('<div id="rbro_doc_element_remove_empty_element_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_remove_empty_element">
                      ${this.rb.getLabel('docElementRemoveEmptyElement')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elRemoveEmptyElement = $('<input id="rbro_doc_element_remove_empty_element" type="checkbox">')
            .change(event => {
                let removeEmptyElementChecked = elRemoveEmptyElement.is(":checked");
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

        elDiv = $('<div id="rbro_doc_element_always_print_on_same_page_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_always_print_on_same_page">
                      ${this.rb.getLabel('docElementAlwaysPrintOnSamePage')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elAlwaysPrintOnSamePage = $('<input id="rbro_doc_element_always_print_on_same_page" type="checkbox">')
            .change(event => {
                let alwaysPrintOnSamePageChecked = elAlwaysPrintOnSamePage.is(":checked");
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
        elFormField.append('<div id="rbro_doc_element_always_print_on_same_page_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        elPrintSectionDiv.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_shrink_to_content_height_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_shrink_to_content_height">
                      ${this.rb.getLabel('docElementShrinkToContentHeight')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elShrinkToContentHeight = $('<input id="rbro_doc_element_shrink_to_content_height" type="checkbox">')
            .change(event => {
                let shrinkToContentHeightChecked = elShrinkToContentHeight.is(":checked");
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

        elDiv = $('<div id="rbro_doc_element_pattern_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_pattern">${this.rb.getLabel('docElementPattern')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elPattern = $('<input id="rbro_doc_element_pattern">')
            .on('input', event => {
                let val = elPattern.val();
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
        let elLink = $('<input id="rbro_doc_element_link">')
            .on('input', event => {
                let val = elLink.val();
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

        elDiv = $('<div id="rbro_doc_element_grow_weight_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_grow_weight">
                      ${this.rb.getLabel('docElementGrowWeight')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        let elGrowWeight = $(`<select id="rbro_doc_element_grow_weight">
                <option value="0">-</option>
                <option value="1">1 (${this.rb.getLabel('docElementGrowWeightLow')})</option>
                <option value="2">2</option>
                <option value="3">3 (${this.rb.getLabel('docElementGrowWeightHigh')})</option>
            </select>`)
            .change(event => {
                let val = elGrowWeight.val();
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
        elFormField.append(`<div class="rbroInfo">${this.rb.getLabel('docElementGrowWeightInfo')}</div>`);
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
            '<div id="rbro_doc_element_cs_style_header" class="rbroFormRow rbroPanelSection"></div>')
            .click(event => {
                $('#rbro_doc_element_cs_style_header').toggleClass('rbroPanelSectionHeaderOpen');
                $('#rbro_doc_element_cs_style_section').toggleClass('rbroHidden');
                elCsStyleHeaderIcon.toggleClass('rbroIcon-plus');
                elCsStyleHeaderIcon.toggleClass('rbroIcon-minus');
                if (elCsStyleHeaderIcon.hasClass('rbroIcon-minus')) {
                    let sectionOffset = document.getElementById(
                        'rbro_doc_element_cs_style_section_container').offsetTop;
                    $('#rbro_detail_panel').scrollTop(sectionOffset);
                }
            });
        elCsStyleHeader.append(elCsStyleHeaderIcon);
        elCsStyleHeader.append(`<span>${this.rb.getLabel('docElementConditionalStyle')}</span>`);
        elDiv.append(elCsStyleHeader);
        elCsStyleSectionContainer.append(elDiv);

        let elCsStyleSectionDiv = $('<div id="rbro_doc_element_cs_style_section" class="rbroHidden"></div>');

        elDiv = $('<div id="rbro_doc_element_cs_condition_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_cs_condition">
                      ${this.rb.getLabel('docElementConditionalStyleCondition')}:</label>`);
        elFormField = $('<div class="rbroFormField rbroSplit rbroSelector"></div>');
        let elCondStyleCondition = $('<textarea id="rbro_doc_element_cs_condition" rows="1"></textarea>')
            .on('input', event => {
                let val = elCondStyleCondition.val();
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
        elFormField.append(elCondStyleCondition);
        elParameterButton = $('<div class="rbroButton rbroRoundButton rbroIcon-select"></div>')
            .click(event => {
                let selectedObjects = this.rb.getSelectedObjects();
                // data source parameters are not shown in case multiple objects are selected
                let selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;

                this.rb.getPopupWindow().show(
                    this.rb.getParameterItems(selectedObject), null,
                    'rbro_doc_element_cs_condition', 'cs_condition', PopupWindow.type.parameterAppend);
            });
        elFormField.append(elParameterButton);
        elFormField.append('<div id="rbro_doc_element_cs_condition_error" class="rbroErrorMessage"></div>');
        elDiv.append(elFormField);
        elCsStyleSectionDiv.append(elDiv);

        elDiv = $('<div id="rbro_doc_element_cs_style_id_row" class="rbroFormRow"></div>');
        elDiv.append(`<label for="rbro_doc_element_cs_style_id">${this.rb.getLabel('docElementStyle')}:</label>`);
        elFormField = $('<div class="rbroFormField"></div>');
        this.elCsStyle = $('<select id="rbro_doc_element_cs_style_id"></select>')
            .change(event => {
                let val = this.elCsStyle.val();
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

        let elCsStyleDiv = $('<div id="rbro_doc_element_cs_style_settings"></div>');
        StylePanel.renderStyle(elCsStyleDiv, 'doc_element_cs_', 'cs_', false, this.controls, this.rb);
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
                        let sectionOffset = document.getElementById(
                            'rbro_doc_element_spreadsheet_section_container').offsetTop;
                        $('#rbro_detail_panel').scrollTop(sectionOffset);
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

            elDiv = $('<div id="rbro_doc_element_spreadsheet_column_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_doc_element_spreadsheet_column">
                          ${this.rb.getLabel('docElementSpreadsheetColumn')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetColumn = $('<input id="rbro_doc_element_spreadsheet_column" type="number">')
                .on('input', event => {
                    let val = elSpreadsheetColumn.val();
                    if (val !== '') {
                        val = utils.checkInputDecimal(val, 1, 99);
                    }
                    if (val !== elSpreadsheetColumn.val()) {
                        elSpreadsheetColumn.val(val);
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
            elFormField.append('<div id="rbro_doc_element_spreadsheet_column_error" class="rbroErrorMessage"></div>');
            elDiv.append(elFormField);
            elSpreadsheetSectionDiv.append(elDiv);

            elDiv = $('<div id="rbro_doc_element_spreadsheet_colspan_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_doc_element_spreadsheet_colspan">
                          ${this.rb.getLabel('docElementSpreadsheetColspan')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetColspan = $('<input id="rbro_doc_element_spreadsheet_colspan" type="number">')
                .on('input', event => {
                    let val = elSpreadsheetColspan.val();
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
            elFormField.append('<div id="rbro_doc_element_spreadsheet_colspan_error" class="rbroErrorMessage"></div>');
            elDiv.append(elFormField);
            elSpreadsheetSectionDiv.append(elDiv);

            elDiv = $('<div id="rbro_doc_element_spreadsheet_add_empty_row_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_doc_element_spreadsheet_add_empty_row">
                          ${this.rb.getLabel('docElementSpreadsheetAddEmptyRow')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetAddEmptyRow = $('<input id="rbro_doc_element_spreadsheet_add_empty_row" type="checkbox">')
                .change(event => {
                    let spreadsheetAddEmptyRowChecked = elSpreadsheetAddEmptyRow.is(":checked");
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

            elDiv = $('<div id="rbro_doc_element_spreadsheet_text_wrap_row" class="rbroFormRow"></div>');
            elDiv.append(`<label for="rbro_doc_element_spreadsheet_text_wrap">
                          ${this.rb.getLabel('docElementSpreadsheetTextWrap')}:</label>`);
            elFormField = $('<div class="rbroFormField"></div>');
            let elSpreadsheetTextWrap = $('<input id="rbro_doc_element_spreadsheet_text_wrap" type="checkbox">')
                .change(event => {
                    let spreadsheetTextWrapChecked = elSpreadsheetTextWrap.is(":checked");
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
            panel.append(elSpreadsheetSectionContainer);
            // -------------------------------
            // --- Spreadsheet Section End ---
            // -------------------------------
        }

        $('#rbro_detail_panel').append(panel);

        this.setupRichText();
    }

    renderStyleSelect() {
        this.elStyle.empty();
        this.elCsStyle.empty();
        this.elStyle.append(`<option value="">${this.rb.getLabel('styleNone')}</option>`);
        this.elCsStyle.append(`<option value="">${this.rb.getLabel('styleNone')}</option>`);
        let styles = this.rb.getStyles();
        for (let style of styles) {
            this.elStyle.append(`<option value="${style.getId()}">${style.getName()}</option>`);
            this.elCsStyle.append(`<option value="${style.getId()}">${style.getName()}</option>`);
        }
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

        $('#rbro_doc_element_rich_text_content_toolbar_parameter').click(event => {
            let selectedObjects = this.rb.getSelectedObjects();
            // data source parameters are not shown in case multiple objects are selected
            let selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;

            this.rb.getPopupWindow().show(
                this.rb.getParameterItems(selectedObject), null,
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
     * Is called when the selection is changed or the selected element was changed.
     * The panel is updated to show the values of the selected data objects.
     * @param {String} [field] - affected field in case of change operation.
     */
    updateDisplay(field) {
        let selectedObjects = this.rb.getSelectedObjects();

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
        for (let property in this.propertyDescriptors) {
            if (this.propertyDescriptors.hasOwnProperty(property)) {
                let propertyDescriptor = this.propertyDescriptors[property];
                let visibleIfField = null;
                let visibleIfValue = null;
                let visibleIfFieldNegate = false;
                if ('visibleIf' in propertyDescriptor) {
                    let visibleIf = propertyDescriptor['visibleIf'];
                    if (visibleIf.startsWith('!')) {
                        visibleIfField = visibleIf.substr(1);
                        visibleIfValue = false;
                    } else {
                        let opIdx = visibleIf.indexOf('==');
                        if (opIdx !== -1) {
                            visibleIfField = visibleIf.substr(0, opIdx);
                            visibleIfValue = visibleIf.substr(opIdx + 2);
                        } else {
                            visibleIfField = visibleIf;
                            visibleIfValue = true;
                        }
                    }
                }
                if (field === null || property === field || (visibleIfField !== null && visibleIfField === field)) {
                    let show = false;
                    if (property in sharedProperties) {
                        if (sharedProperties[property] === selectedObjects.length) {
                            let value = null;
                            let differentValues = false;
                            for (let obj of selectedObjects) {
                                let objValue = obj.getUpdateValue(property, obj.getValue(property));
                                if (value === null) {
                                    value = objValue;
                                } else if (propertyDescriptor['type'] === SetValueCmd.type.richText) {
                                    if (objValue && value) {
                                        let diff = new Delta(objValue).diff(new Delta(value));
                                        if (diff.ops.length > 0) {
                                            differentValues = true;
                                            break;
                                        }
                                    }
                                } else if (objValue !== value) {
                                    differentValues = true;
                                    break;
                                }
                            }

                            if (differentValues && propertyDescriptor['type'] === SetValueCmd.type.select &&
                                propertyDescriptor['allowEmpty']) {
                                // if values are different and dropdown has empty option then select
                                // empty dropdown option
                                value = '';
                            }
                            super.setValue(propertyDescriptor, value, differentValues);

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

                    if (show && visibleIfField) {
                        for (let obj of selectedObjects) {
                            let objValue = obj.getValue(visibleIfField);
                            if (typeof visibleIfValue === 'boolean' && typeof objValue !== 'boolean') {
                                // convert object value to boolean if compared to a boolean value
                                objValue = !!objValue;
                            }
                            if ((!visibleIfFieldNegate && objValue !== visibleIfValue) ||
                                (visibleIfFieldNegate && objValue === visibleIfValue)) {
                                show = false;
                                delete sharedProperties[property];
                                break;
                            }
                        }
                    }

                    if ('singleRowProperty' in propertyDescriptor &&
                        !propertyDescriptor['singleRowProperty']) {
                        // only handle visibility of control and not of whole row.
                        // row visibility will be handled below, e.g. for button groups
                        let propertyId = `#rbro_doc_element_${propertyDescriptor['fieldId']}`;
                        if (show) {
                            $(propertyId).removeClass('rbroHidden');
                        } else {
                            $(propertyId).addClass('rbroHidden');
                        }
                    } else {
                        let rowId = this.getRowId(propertyDescriptor);
                        if (show) {
                            $('#' + rowId).removeClass('rbroHidden');
                        } else {
                            $('#' + rowId).addClass('rbroHidden');
                        }
                    }
                }
            }
        }

        if (field === null || this.visibleIfFields.includes(field)) {
            // only update labels, visible rows and sections if selection was changed (no specific field update)
            // or field is referenced in visibleIf property (and therefor could have
            // influence on visibility of other fields)

            // sharedProperties now only contains properties shared by all objects

            for (let property in this.propertyDescriptors) {
                if (this.propertyDescriptors.hasOwnProperty(property)) {
                    let propertyDescriptor = this.propertyDescriptors[property];
                    if ('rowId' in propertyDescriptor && 'rowProperties' in propertyDescriptor) {
                        let shownPropertyCount = 0;
                        for (let rowProperty of propertyDescriptor['rowProperties']) {
                            if (rowProperty in sharedProperties) {
                                shownPropertyCount++;
                            }
                        }
                        if ('labelId' in propertyDescriptor) {
                            let label = propertyDescriptor['defaultLabel'];
                            if (shownPropertyCount === 1) {
                                // get label of single property shown in this property group, e.g. label
                                // is changed to "Width" instead of "Size (Width, Height)" if only width property
                                // is shown and not both width and height.
                                for (let rowProperty of propertyDescriptor['rowProperties']) {
                                    if (rowProperty in sharedProperties) {
                                        label = this.propertyDescriptors[rowProperty]['singlePropertyLabel'];
                                        break;
                                    }
                                }
                            }
                            $('#' + propertyDescriptor['labelId']).text(this.rb.getLabel(label) + ':');
                        }
                        if (shownPropertyCount > 0) {
                            $('#' + propertyDescriptor['rowId']).removeClass('rbroHidden');
                        } else {
                            $('#' + propertyDescriptor['rowId']).addClass('rbroHidden');
                        }
                    }
                }
            }

            // show section if there is at least one property shown in section
            for (let section of ['style', 'print', 'cs_style', 'spreadsheet']) {
                if (section in sectionPropertyCount) {
                    $(`#rbro_doc_element_${section}_section_container`).removeClass('rbroHidden');
                } else {
                    $(`#rbro_doc_element_${section}_section_container`).addClass('rbroHidden');
                }
            }
        }

        DocElementPanel.updateAutosizeInputs(field);
    }

    static updateAutosizeInputs(field) {
        if (field === null || field === 'dataSource') {
            autosize.update($('#rbro_doc_element_data_source'));
        }
        if (field === null || field === 'content') {
            autosize.update($('#rbro_doc_element_content'));
        }
        if (field === null || field === 'source') {
            autosize.update($('#rbro_doc_element_source'));
        }
        if (field === null || field === 'expression') {
            autosize.update($('#rbro_doc_element_group_expression'));
        }
        if (field === null || field === 'printIf') {
            autosize.update($('#rbro_doc_element_print_if'));
        }
    }

    show() {
        this.renderStyleSelect();
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
}
