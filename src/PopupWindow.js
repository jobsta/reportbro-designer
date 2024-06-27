import SetValueCmd from './commands/SetValueCmd';
import Parameter from './data/Parameter';
import DocElement from './elements/DocElement';
import * as utils from './utils';
import autosize from 'autosize';

/**
 * Popup window to show selectable items (parameters, patterns, etc.) or to edit test data for array parameter.
 * @class
 */
export default class PopupWindow {
    constructor(rootElement, rb) {
        this.rootElement = rootElement;
        this.rb = rb;
        this.elWindow = null;
        this.elContent = null;
        this.input = null;
        this.objId = null;
        this.field = null;
        this.type = null;
        this.visible = false;
        this.items = null;
        this.rootParameter = null;
        this.rootDataType = null;
        this.rootFields = null;
        this.dataEmptyBeforeEdit = true;
        this.nextRowId = -1;
        this.rowMap = null;
    }

    render() {
        this.elWindow = utils.createElement('div', { class: 'rbroPopupWindow rbroHidden' });
        this.elContent = utils.createElement('div', { class: 'rbroPopupWindowContent' });
        this.elContent.addEventListener('mouseup', (event) => {
            // stop propagation so popup window is not closed
            event.stopPropagation();
        });
        this.elWindow.append(this.elContent);
        let btn = utils.createElement(
            'div', { class: 'rbroButton rbroRoundButton rbroPopupWindowCancel rbroIcon-cancel' });
        btn.addEventListener('click', (event) => {
            this.hide();
        });
        this.elWindow.append(btn);
        document.body.append(this.elWindow);
    }

    /**
     * Is called when the ReportBro instance is deleted and should be used
     * to cleanup elements and event handlers.
     */
    destroy() {
        this.elWindow.remove();
    }

    /**
     * Shows a popup window for the given items.
     * @param {Object[]} items - items to display in the popup window. Each item must contain a name (String), and
     * optional a description (String) and separator (Boolean). If separator is true the item is not selectable.
     * @param {String} objId - id of data object where the field belongs to, used to set the data value
     * when popup is closed. If this is no data popup then the objId is not used.
     * @param {String} tagId - id of DOM element in the panel for the given field. In case of empty string there is no
     * input element available.
     * @param {String} field - field of data object where selected item will be written into.
     * @param {PopupWindow.type} type
     * @param {?Quill} quill - rich text editor instance, must be set if parameter is appended to rich text control,
     * otherwise the text input of element with tagId will be used (default).
     * @param {?Parameter} parameter - parameter with fields and data, only used when "type" is PopupWindow.type.data.
     * @param {?String} rootDataType - root data type (array, simpleArray or map),
     * only required when "type" is PopupWindow.type.data and
     * *parameter* is null (when parameter is available then data type will be retrieved from parameter).
     * @param {?Object[]} fields - list of fields where each entry contains keys for "name" and "type",
     * only required when "type" is PopupWindow.type.data and
     * *parameter* is null (when parameter is available then fields will be retrieved from parameter).
     * @param {?Object} data - object containing existing data (array or map),
     * only required when "type" is PopupWindow.type.data and
     * *parameter* is null (when parameter is available data will be retrieved from parameter test data).
     */
    show(items, objId, tagId, field, type, quill, parameter, rootDataType, fields, data) {
        let winWidth = window.innerWidth;
        let winHeight = window.innerHeight;
        let elSearch = null;
        let quillSelectionRange = null;
        this.input = (tagId !== '') ? document.getElementById(tagId) : null;
        this.objId = objId;
        this.field = field;
        this.type = type;
        this.items = items;
        utils.emptyElement(this.elContent);
        this.rootParameter = parameter;
        this.rootDataType = rootDataType;
        this.rootFields = fields;
        this.nextRowId = 1;
        this.rowMap = {};

        if (quill) {
            // save selection of rich text editor because selection is lost when editor looses focus
            quillSelectionRange = quill.getSelection();
        }

        if (type === PopupWindow.type.data)  {
            if (parameter) {
                console.assert(rootDataType === null && fields === null && data === null);
                rootDataType = parameter.type;
                fields = parameter.getParameterFields();
                data = parameter.getTestData(true);
            } else {
                if (rootDataType === Parameter.type.map) {
                    this.dataEmptyBeforeEdit = Object.keys(data).length === 0;
                } else if ((rootDataType === Parameter.type.array || rootDataType === Parameter.type.simpleArray) &&
                    Array.isArray(data)) {
                    this.dataEmptyBeforeEdit = (data.length === 0);
                } else {
                    this.dataEmptyBeforeEdit = false;
                }
            }
            this.createDataTable(this.elContent, parameter, rootDataType, fields, data);
            let width = Math.round(winWidth * 0.8);
            let height = Math.round(winHeight * 0.8);
            const windowScrollPos = document.querySelector('html').scrollTop;
            this.elWindow.style.left = Math.round((winWidth - width) / 2) + 'px';
            this.elWindow.style.top = (Math.round((winHeight - height) / 2) + windowScrollPos) + 'px';
            this.elWindow.style.width = width + 'px';
            this.elWindow.style.height = height + 'px';
            document.body.append(
                utils.createElement('div', { id: 'rbro_background_overlay', class: 'rbroBackgroundOverlay' }));
            document.body.classList.add('rbroFixedBackground'); // no scroll bars for background while popup is shown
        } else {
            if (type === PopupWindow.type.parameterSet || type === PopupWindow.type.parameterAppend) {
                elSearch = utils.createElement('input', {
                    class: 'rbroPopupSearch', placeholder: this.rb.getLabel('parameterSearchPlaceholder'),
                    autocomplete: 'off'
                });
                elSearch.addEventListener('input', (event) => {
                    this.filterParameters(elSearch.value);
                });
                this.elContent.append(elSearch);
            }
            let ul = utils.createElement('ul');
            ul.addEventListener('mousedown', (event) => {
                // prevent default so blur event of input is not triggered,
                // otherwise popup window would be closed before click event handler of selected
                // item is triggered
                event.preventDefault();
            });
            for (const item of items) {
                const li = utils.createElement('li');
                if (item.separator) {
                    if ((type === PopupWindow.type.parameterSet ||
                            type === PopupWindow.type.parameterAppend) && item.id) {
                        li.setAttribute('id', 'parameter_group_' + item.id);
                    }
                    let separatorClass = 'rbroPopupItemSeparator';
                    if (item.separatorClass) {
                        separatorClass += ' ' + item.separatorClass;
                    }
                    li.setAttribute('class', separatorClass);
                } else {
                    if ((type === PopupWindow.type.parameterSet ||
                            type === PopupWindow.type.parameterAppend) && item.id) {
                        li.setAttribute('id', 'parameter_' + item.id);
                    }
                    li.addEventListener('mousedown', (event) => {
                        if (type === PopupWindow.type.pattern) {
                            this.input.value = item.name;
                            this.input.dispatchEvent(new Event('input'));
                            this.hide();
                        } else if (type === PopupWindow.type.parameterSet ||
                                type === PopupWindow.type.parameterAppend) {
                            const dataSourcePrefix = (item.dataSourceName !== null) ? (item.dataSourceName + ':') : '';
                            const paramText = '${' + dataSourcePrefix + item.name + '}';
                            if (type === PopupWindow.type.parameterSet) {
                                this.input.value = paramText;
                                this.input.dispatchEvent(new Event('input'));
                                autosize.update(this.input);
                            } else {
                                if (quill) {
                                    if (quillSelectionRange) {
                                        quill.insertText(quillSelectionRange.index, paramText);
                                    }
                                } else {
                                    utils.insertAtCaret(this.input, paramText);
                                    autosize.update(this.input);
                                    this.input.dispatchEvent(new Event('input'));
                                }
                            }
                            this.hide();
                        }
                        event.preventDefault();
                    });
                }
                li.append(utils.createElement('div', { class: 'rbroPopupItemHeader' }, item.name));
                if (item.description && item.description !== '') {
                    li.append(utils.createElement('div', { class: 'rbroPopupItemDescription' }, item.description));
                }
                ul.append(li);
            }
            this.elContent.append(ul);
            const offset = utils.getElementOffset(this.input);
            let top = offset.top;
            // test if popup window should be shown above or below input field
            if (top < (winHeight / 2) || top < 300) {
                // make sure there is enough space for popup below input, otherwise just show it over input field
                if ((top + this.input.clientHeight + 300) < winHeight) {
                    top += this.input.clientHeight;
                }
            } else {
                top -= 300;
            }
            this.elWindow.style.left = offset.left + 'px';
            this.elWindow.style.top = top + 'px';
            this.elWindow.style.width = '400px';
            this.elWindow.style.height = '300px';
        }

        this.elWindow.classList.remove('rbroHidden');
        this.visible = true;
        if (elSearch !== null) {
            elSearch.focus();
        }

        const elTextareas = this.elWindow.querySelectorAll('textarea');
        for (const elTextarea of elTextareas) {
            autosize.update(elTextarea);
        }
    }

    hide() {
        if (this.visible) {
            if (this.input !== null) {
                this.input.focus();
            }
            if (this.type === PopupWindow.type.data) {
                let data;
                let updateData = true;
                if (this.rootParameter) {
                    data = this.getTestData(this.elContent, this.rootParameter);
                } else {
                    data = this.getData(this.elContent, this.rootDataType, this.rootFields);
                    // in case a data field was edited and the value was previously empty we only update the field
                    // if there is at least one non-empty value. this prevents accidentally adding a row to a
                    // list because the popup window adds an empty row if a list is empty.
                    if (this.dataEmptyBeforeEdit) {
                        if (this.rootDataType === Parameter.type.map) {
                            updateData = this.isDataEmpty(data, this.rootFields);
                        } else if ((this.rootDataType === Parameter.type.array ||
                                this.rootDataType === Parameter.type.simpleArray) && Array.isArray(data)) {
                            if (data.length === 0) {
                                updateData = false;
                            } else if (data.length === 1) {
                                updateData = !this.isDataEmpty(data[0], this.rootFields);
                            }
                        }
                    }
                }

                if (updateData) {
                    const obj = this.rb.getDataObject(this.objId);
                    const dataStr = JSON.stringify(data);
                    if (obj !== null && obj.getValue(this.field) !== dataStr) {
                        let cmd = new SetValueCmd(this.objId, this.field, dataStr, SetValueCmd.type.text, this.rb);
                        this.rb.executeCommand(cmd);
                    }
                }
                document.getElementById('rbro_background_overlay').remove();
            }
            this.elWindow.classList.add('rbroHidden');
            utils.emptyElement(this.elContent);
            document.body.classList.remove('rbroFixedBackground');
            this.visible = false;
            this.items = null;
        }
    }

    /**
     * Return true if the given data object has a field with a non-empty value.
     * @param {Object} data - data object
     * @param {Object[]} fields - list of fields where each entry contains keys for "name" and "type"
     * @returns {Boolean}
     */
    isDataEmpty(data, fields) {
        let empty = true;
        for (const field of fields) {
            if (field.name in data) {
                const fieldData = data[field.name];
                if (field.type === Parameter.type.string || field.type === Parameter.type.number ||
                    field.type === Parameter.type.date) {
                    if (fieldData !== '') {
                        empty = false;
                    }
                } else if (field.type === Parameter.type.boolean) {
                    if (fieldData) {
                        empty = false;
                    }
                } else if (field.type === Parameter.type.image) {
                    if (typeof fieldData === 'object' && 'filename' in fieldData && fieldData.filename !== '') {
                        empty = false;
                    }
                } else if (field.type === Parameter.type.array || field.type === Parameter.type.simpleArray) {
                    if (fieldData.length > 0) {
                        empty = false;
                    }
                } else if (field.type === Parameter.type.map) {
                    if (Object.keys(fieldData).length > 0) {
                        empty = false;
                    }
                }
            }
        }
        return empty;
    }

    createDataTable(elRoot, parentParameter, parentType, fields, data) {
        const div = utils.createElement('div');
        const table = utils.createElement('table');
        const tableHeaderRow = utils.createElement('tr');
        const tableBody = utils.createElement('tbody');
        let i;

        // make sure test data is valid, use empty test data according to parent parameter type
        if (parentType === Parameter.type.array || parentType === Parameter.type.simpleArray) {
            if (!Array.isArray(data)) {
                data = [];
            }
        } else if (parentType === Parameter.type.map) {
            if (!data || Object.getPrototypeOf(data) !== Object.prototype) {
                data = {};
            }
        }

        // create table header
        // column with button to delete row
        const elTh = utils.createElement('th');
        if (parentType === Parameter.type.map) {
            // for a map we only show one row with columns for each field, the row cannot be deleted
            elTh.style.display = 'none';
        }
        tableHeaderRow.append(elTh);
        for (const field of fields) {
            const elTh = utils.createElement('th', {}, field.label ? field.label : field.name);
            if (field.type === Parameter.type.image) {
                elTh.append(
                    utils.createElement(
                        'span', { title: this.rb.getLabel('parameterTestDataImageInfo'), class: 'rbroIcon-info' }));

            }
            tableHeaderRow.append(elTh);
        }
        const elTableHeader = utils.createElement('thead');
        elTableHeader.append(tableHeaderRow);
        table.append(elTableHeader);

        if (parentType === Parameter.type.map) {
            // in case of a map we put the map data into an array so the data can be displayed
            // in a table with one row
            const items = [data];
            this.addDataRow(tableBody, parentParameter, parentType, fields, items, 0);
        } else {
            const items = Array.isArray(data) ? data : [];
            // create content rows for data
            if (items.length === 0) {
                this.addEmptyDataRow(tableBody, parentParameter, parentType, fields);
            } else {
                for (i=0; i < items.length; i++) {
                    this.addDataRow(tableBody, parentParameter, parentType, fields, items, i);
                }
            }
        }
        table.append(tableBody);
        div.append(table);
        // for a map we show exactly one row where each map item is displayed in an own column
        if (parentType !== Parameter.type.map) {
            const elAddButton = utils.createElement('div', { class: 'rbroButton rbroFullWidthButton' });
            elAddButton.append(
                utils.createElement(
                    'div', { class: 'rbroButton rbroPopupWindowButton' }, this.rb.getLabel('popupWindowAddDataRow')));
            elAddButton.addEventListener('click', (event) => {
                this.addEmptyDataRow(tableBody, parentParameter, parentType, fields);
            });
            div.append(elAddButton);
        }
        utils.emptyElement(elRoot);
        elRoot.append(div);
    }

    addEmptyDataRow(tableBody, parentParameter, parentType, fields) {
        const emptyRow = {};
        for (const field of fields) {
            if (field.type === Parameter.type.array || field.type === Parameter.type.simpleArray) {
                emptyRow[field.name] = [];
            } else if (field.type === Parameter.type.map) {
                emptyRow[field.name] = {};
            } else {
                emptyRow[field.name] = '';
            }
        }
        const items = [emptyRow];
        this.addDataRow(tableBody, parentParameter, parentType, fields, items, 0);
    }

    addDataRow(tableBody, parentParameter, parentType, fields, items, rowIndex) {
        const data = items[rowIndex];
        const newRow = utils.createElement('tr');
        newRow.dataset.rowId = String(this.nextRowId);
        this.rowMap[String(this.nextRowId)] = { type: 'row', data: data };
        this.nextRowId++;
        const elColumn = utils.createElement('td');
        if (parentType !== Parameter.type.map) {
            const elDeleteButton = utils.createElement('div', { class: 'rbroButton rbroDeleteButton rbroIcon-cancel' });
            elDeleteButton.addEventListener('click', (event) => {
                // delete row, therefor we have to remove the parent of the parent: tr > td > div
                const elRow = event.target.parentElement.parentElement;
                const rowId = elRow.dataset.rowId;
                elRow.remove();
                // now also delete data for row item
                const rowMapEntry = this.rowMap[rowId];
                items.splice(items.indexOf(rowMapEntry.data), 1);
                delete this.rowMap[rowId];
            });
            elColumn.append(elDeleteButton);
        } else {
            // for a map we only show one row with columns for each field, the row cannot be deleted
            elColumn.style.display = 'none';
        }
        newRow.append(elColumn);
        const columnCount = fields.length;
        for (const field of fields) {
            // make sure field is present in data
            let fieldData = (field.type === Parameter.type.array || field.type === Parameter.type.simpleArray) ?
                [] : '';
            if (data !== null && field.name in data) {
                fieldData = data[field.name];
            }
            this.appendColumn(newRow, field, fieldData, data, columnCount);
        }
        tableBody.append(newRow);
    }

    appendColumn(elRow, field, data, parentData, columnCount) {
        const elTd = utils.createElement('td');
        if (field.type === Parameter.type.array || field.type === Parameter.type.simpleArray ||
                field.type === Parameter.type.map) {
            const elExpandableCell = utils.createElement('div', { class: 'expandableCell' });
            const elExpandableCellIcon = utils.createElement('span', { class: 'rbroIcon-plus' });
            elExpandableCell.append(elExpandableCellIcon);
            const elNestedTableInfo = utils.createElement('span');
            elExpandableCell.append(elNestedTableInfo);
            elExpandableCell.addEventListener('click', (event) => {
                const expand = !elExpandableCell.classList.contains('rbroExpandedCell');
                const nextEl = elRow.nextElementSibling;
                if (nextEl && nextEl.tagName === 'TR') {
                    const nestedTable = nextEl.querySelector('td table')
                    if (nestedTable) {
                        const elExpandableCells = elRow.querySelectorAll('.expandableCell');
                        for (const elExpandableCell of elExpandableCells) {
                            if (elExpandableCell.classList.contains('rbroExpandedCell')) {
                                elExpandableCell.classList.remove('rbroExpandedCell');
                                const elCellIcon = elExpandableCell.children[0];
                                const elCellNestedTableInfo = elExpandableCell.children[1];
                                elCellIcon.classList.remove('rbroIcon-minus');
                                elCellIcon.classList.add('rbroIcon-plus');

                                const rowMapEntry = this.rowMap[nextEl.dataset.rowId];
                                if (rowMapEntry.type === 'table') {
                                    // save test data before table is removed
                                    rowMapEntry.parentData[rowMapEntry.field.name] = this.getTestData(
                                        nestedTable, rowMapEntry.field.parameter);

                                    if (rowMapEntry.field.type === Parameter.type.array ||
                                            rowMapEntry.field.type === Parameter.type.simpleArray) {
                                        // update nested table info for collapsed cell
                                        const arrayLength = (rowMapEntry.field.name in parentData &&
                                            Array.isArray(parentData[rowMapEntry.field.name])) ?
                                            parentData[rowMapEntry.field.name].length : 0;
                                        this.setTableRowCount(elCellNestedTableInfo, arrayLength);
                                    }
                                }
                                break;
                            }
                        }
                        nextEl.remove();
                    }
                }

                if (expand) {
                    const elRowNestedTable = utils.createElement('tr');
                    elRowNestedTable.dataset.rowId = String(this.nextRowId);
                    this.rowMap[String(this.nextRowId)] = { type: 'table', field: field, parentData: parentData };
                    this.nextRowId++;
                    // add 1 for column containing delete button for row
                    const elTdNestedTable = utils.createElement('td', { colspan: String(columnCount + 1) });
                    const nestedFields = field.parameter.getParameterFields();
                    if (nestedFields.length > 0) {
                        // get test data from parent data because data could have been updated in the meantime
                        const testData = parentData[field.name];
                        this.createDataTable(
                            elTdNestedTable, field.parameter, field.parameter.type, nestedFields, testData);
                        elRowNestedTable.append(elTdNestedTable);
                        elRow.insertAdjacentElement('afterend', elRowNestedTable);
                        elExpandableCell.classList.add('rbroExpandedCell');
                        elExpandableCellIcon.classList.remove('rbroIcon-plus');
                        elExpandableCellIcon.classList.add('rbroIcon-minus');
                        elNestedTableInfo.textContent = '';
                    } else {
                        if (field.parameter.getValue('type') === Parameter.type.map) {
                            alert(this.rb.getLabel('parameterEditTestDataMapNoFields'));
                        } else {
                            alert(this.rb.getLabel('parameterEditTestDataArrayNoFields'));
                        }
                    }
                }
            });
            if (field.type === Parameter.type.array || field.type === Parameter.type.simpleArray) {
                const arrayLength = (field.name in parentData && Array.isArray(parentData[field.name])) ?
                    parentData[field.name].length : 0;
                this.setTableRowCount(elNestedTableInfo, arrayLength);
            }
            elTd.append(elExpandableCell);
        } else {
            if (field.type === Parameter.type.image) {
                const elDataImageContainer = utils.createElement('div', { class: 'rbroImageFileContainer' });
                const elDataImage = utils.createElement('input', { type: 'file' });
                elDataImage.addEventListener('change', (event) => {
                    function setImage(imageData, imageFileName) {
                        parentData[field.name] = { data: imageData, filename: imageFileName };
                        elDataFilenameDiv.classList.remove('rbroHidden');
                        elDataFilename.textContent = imageFileName;
                    }

                    const files = event.target.files;
                    if (files && files[0]) {
                        utils.readImageData(files[0], setImage, this.rb);
                    }
                });
                elDataImageContainer.append(elDataImage);
                const elDataFilenameDiv = utils.createElement('div', { class: 'rbroImageFile rbroHidden' });
                const elDataFilename = utils.createElement('div');
                elDataFilenameDiv.append(elDataFilename);
                const elDataImageFilenameClear = utils.createElement(
                    'div', { class: 'rbroIcon-cancel rbroButton rbroDeleteButton rbroRoundButton' });
                elDataImageFilenameClear.addEventListener('click', (event) => {
                    elDataImage.value = '';
                    parentData[field.name] = { data: '', filename: '' };
                    elDataFilenameDiv.classList.add('rbroHidden');
                    elDataFilename.textContent = '';
                });
                elDataFilenameDiv.append(elDataImageFilenameClear);
                elDataImageContainer.append(elDataFilenameDiv);
                if (data.filename) {
                    elDataFilename.textContent = data.filename;
                    elDataFilenameDiv.classList.remove('rbroHidden');
                }
                elTd.append(elDataImageContainer);

            } else {
                // "simple" test data which can be displayed with an input control
                let control;
                if (field.attributes && field.attributes.multiLine) {
                    console.assert(field.type === Parameter.type.string);
                    control = utils.createElement('textarea', { rows: 1 });
                    if (data) {
                        control.value = data;
                    }
                    autosize(control);
                } else if (field.attributes && field.attributes.select) {
                    console.assert(field.type === Parameter.type.string || field.type === Parameter.type.number);
                    control = utils.createElement('select');
                    if (field.attributes.select === 'style') {
                        utils.populateStyleSelect(control, DocElement.type.text, data ? data : null, this.rb);
                    }
                } else {
                    control = utils.createElement('input');
                    if (field.type === Parameter.type.boolean) {
                        control.setAttribute('type', 'checkbox');
                        if (data) {
                            control.checked = true;
                        }
                        elTd.classList.add('rbroDataCheckbox');
                    } else {
                        control.setAttribute('type', 'text');
                        if (data) {
                            control.setAttribute('value', data);
                        }
                        if (field.type === Parameter.type.number) {
                            utils.setInputDecimal(control);
                        } else if (field.type === Parameter.type.date) {
                            control.setAttribute('placeholder', this.rb.getLabel('parameterTestDataDatePattern'));
                        }
                    }
                }

                control.addEventListener('focus', (event) => {
                    control.parentElement.classList.add('rbroHasFocus');
                });
                control.addEventListener('blur', (event) => {
                    control.parentElement.classList.remove('rbroHasFocus');
                });

                elTd.append(control);
            }
        }
        elRow.append(elTd);
    }

    /**
     * Get test data from html table. Also supports nested table inside cells.
     * @param {Element} elRoot - the table dom element.
     * @param {Parameter} parentParameter - parameter to get test data for. this can either be an array,
     * simple array or map, i.e. a parameter where the test data is edited in the popup dialog.
     * @return {Object|Object[]} map or array containing test data, depending on parent parameter type.
     */
    getTestData(elRoot, parentParameter) {
        return this.getData(elRoot, parentParameter.type, parentParameter.getParameterFields());
    }

    /**
     * Get data from html table. Also supports nested table inside cells.
     * @param {Element} elRoot - the table dom element.
     * @param {String} parentType - type of parent where the fields belong to.
     * type can only be array, simpleArray or map.
     * @param {Object[]} fields - list of objects where each entry contains keys for "type" and "name".
     * @return {Object|Object[]} map or array containing data for given fields.
     */
    getData(elRoot, parentType, fields) {
        let data = [];
        if (parentType === Parameter.type.map) {
            data = {};
        } else if (parentType !== Parameter.type.array && parentType !== Parameter.type.simpleArray) {
            console.assert(false);
            return null;
        }

        const rows = elRoot.querySelector('tbody').children;
        for (let row of rows) {
            const rowMapEntry = this.rowMap[row.dataset.rowId];
            if (rowMapEntry.type === 'table') {
                // get data of nested table
                const nestedParameter = rowMapEntry.field.parameter;
                rowMapEntry.parentData[rowMapEntry.field.name] = this.getData(
                    row, nestedParameter.type, nestedParameter.getParameterFields());
            } else {
                const rowData = rowMapEntry.data;
                let inputs = row.querySelectorAll('input,textarea,select');
                let i = 0;
                for (const field of fields) {
                    // if the field is a nested array/map we ignore it. the nested data could be
                    // updated in the next row in case the array/map was expanded.
                    // see code in block for (rowMapEntry.type === 'table') above
                    if (field.type !== Parameter.type.array && field.type !== Parameter.type.simpleArray &&
                            field.type !== Parameter.type.map) {
                        const input = inputs[i];
                        if (field.type === Parameter.type.boolean) {
                            rowData[field.name] = input.checked;
                        } else if (field.type !== Parameter.type.image) {
                            // for images the data is immediately set when a file is selected
                            rowData[field.name] = input.value.trim();
                        }
                        i++;
                    }
                }
                if (parentType === Parameter.type.array || parentType === Parameter.type.simpleArray) {
                    data.push(rowData);
                } else if (parentType === Parameter.type.map) {
                    // in case of map type there is only one row so we only return a map containing data of this row
                    data = rowData;
                }
            }
        }
        return data;
    }

    /**
     * Sets row count for nested table.
     * A nested table is collapsed per default and can be expanded by click, if the table is collapsed
     * the row count is displayed.
     * @param {Element} el - element to display nested table info.
     * @param {Number} arrayLength - array length of rows in nested table.
     */
    setTableRowCount(el, arrayLength) {
        if (arrayLength === 0) {
            el.textContent = this.rb.getLabel('parameterTestDataRowCountEmpty');
        } else if (arrayLength === 1) {
            el.textContent = this.rb.getLabel('parameterTestDataRowCountOne');
        } else {
            el.textContent = this.rb.getLabel('parameterTestDataRowCount').replace('${count}', String(arrayLength));
        }
    }

    /**
     * Filters list of displayed parameter items. Only parameters containing given search value are
     * shown.
     * @param {String} searchVal - search value.
     */
    filterParameters(searchVal) {
        let currentGroupId = null;
        let groupCount = 0;
        if (this.items !== null) {
            searchVal = searchVal.toLowerCase();
            for (let item of this.items) {
                if (item.separator) {
                    if (currentGroupId !== null) {
                        // hide groups (data source parameters and parameter maps) if they do not contain
                        // any visible items
                        if (groupCount > 0) {
                            document.getElementById('parameter_group_' + currentGroupId).style.display = 'block';
                        } else {
                            document.getElementById('parameter_group_' + currentGroupId).style.display = 'none';
                        }
                    }
                    currentGroupId = item.id ? item.id : null;
                    groupCount = 0;
                } else {
                    if (item.nameLowerCase.indexOf(searchVal) !== -1) {
                        document.getElementById('parameter_' + item.id).style.display = 'block';
                        if (currentGroupId !== -1) {
                            groupCount++;
                        }
                    } else {
                        document.getElementById('parameter_' + item.id).style.display = 'none';
                    }
                }
            }
            if (currentGroupId !== null) {
                if (groupCount > 0) {
                    document.getElementById('parameter_group_' + currentGroupId).style.display = 'block';
                } else {
                    document.getElementById('parameter_group_' + currentGroupId).style.display = 'none';
                }
            }
        }
    }
}

PopupWindow.type = {
    parameterSet: 0,
    parameterAppend: 1,
    pattern: 2,
    data: 3
};
