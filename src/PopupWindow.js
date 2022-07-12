import SetValueCmd from './commands/SetValueCmd';
import Parameter from './data/Parameter';
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
        this.type = null;
        this.visible = false;
        this.items = null;
        this.rootParameter = null;
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
     * @param {String} objId - id of data object where the field belongs to, used to set the test data value
     * when popup is closed. If this is no testData popup then the objId is not used.
     * @param {String} tagId - id of DOM element in the panel for the given field. In case of empty string there is no
     * input element available.
     * @param {String} field - field of data object where selected item will be written into.
     * @param {PopupWindow.type} type
     * @param {Quill} quill - rich text editor instance, must be set if parameter is appended to rich text control,
     * otherwise the text input of element with tagId will be used (default).
     * @param {Parameter} parameter
     */
    show(items, objId, tagId, field, type, quill, parameter) {
        let winWidth = window.innerWidth;
        let winHeight = window.innerHeight;
        let elSearch = null;
        let quillSelectionRange = null;
        this.input = (tagId !== '') ? document.getElementById(tagId) : null;
        this.objId = objId;
        this.type = type;
        this.items = items;
        utils.emptyElement(this.elContent);
        this.rootParameter = parameter;
        this.nextRowId = 1;
        this.rowMap = {};

        if (quill) {
            // save selection of rich text editor because selection is lost when editor looses focus
            quillSelectionRange = quill.getSelection();
        }

        if (type === PopupWindow.type.testData) {
            const testData = parameter.getTestData();
            this.createTestDataTable(this.elContent, parameter, testData);
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
                elSearch = utils.createElement(
                    'input', { class: 'rbroPopupSearch', placeholder: this.rb.getLabel('parameterSearchPlaceholder') });
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
                        } else if (type === PopupWindow.type.parameterSet) {
                            this.input.value = '${' + item.name + '}';
                            this.input.dispatchEvent(new Event('input'));
                            autosize.update(this.input);
                            this.hide();
                        } else if (type === PopupWindow.type.parameterAppend) {
                            const paramText = '${' + item.name + '}';
                            if (quill) {
                                if (quillSelectionRange) {
                                    quill.insertText(quillSelectionRange.index, paramText);
                                }
                            } else {
                                utils.insertAtCaret(this.input, paramText);
                                autosize.update(this.input);
                                this.input.dispatchEvent(new Event('input'));
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
    }

    hide() {
        if (this.visible) {
            if (this.input !== null) {
                this.input.focus();
            }
            if (this.type === PopupWindow.type.testData) {
                let testData = this.getTestData(this.elContent, this.rootParameter);
                let obj = this.rb.getDataObject(this.objId);
                let testDataStr = JSON.stringify(testData);
                if (obj !== null && obj.getValue('testData') !== testDataStr) {
                    let cmd = new SetValueCmd(
                        this.objId, 'testData', testDataStr, SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
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

    createTestDataTable(elRoot, parentParameter, testData) {
        const fields = parentParameter.getParameterFields();
        const div = utils.createElement('div');
        const table = utils.createElement('table');
        const tableHeaderRow = utils.createElement('tr');
        const tableBody = utils.createElement('tbody');
        let i;

        // make sure test data is valid, use empty test data according to parent parameter type
        if (parentParameter.type === Parameter.type.array || parentParameter.type === Parameter.type.simpleArray) {
            if (!Array.isArray(testData)) {
                testData = [];
            }
        } else if (parentParameter.type === Parameter.type.map) {
            if (!testData || Object.getPrototypeOf(testData) !== Object.prototype) {
                testData = {};
            }
        }

        // create table header
        // column with button to delete row
        const elTh = utils.createElement('th');
        if (parentParameter.type === Parameter.type.map) {
            // for a map we only show one row with columns for each field, the row cannot be deleted
            elTh.style.display = 'none';
        }
        tableHeaderRow.append(elTh);
        for (const field of fields) {
            tableHeaderRow.append(utils.createElement('th', {}, field.name));
        }
        const elTableHeader = utils.createElement('thead');
        elTableHeader.append(tableHeaderRow);
        table.append(elTableHeader);

        if (parentParameter.type === Parameter.type.map) {
            // in case of a map we put the map data into an array so the data can be displayed
            // in a table with one row
            const items = [testData];
            this.addTestDataRow(tableBody, parentParameter, fields, items, 0);
        } else {
            const items = Array.isArray(testData) ? testData : [];
            // create content rows for data
            if (items.length === 0) {
                this.addEmptyTestDataRow(tableBody, parentParameter, fields); // xxx , items);
            } else {
                for (i=0; i < items.length; i++) {
                    this.addTestDataRow(tableBody, parentParameter, fields, items, i);
                }
            }
        }
        table.append(tableBody);
        div.append(table);
        // for a map we show exactly one row where each map item is displayed in an own column
        if (parentParameter.type !== Parameter.type.map) {
            const elAddButton = utils.createElement('div', { class: 'rbroButton rbroFullWidthButton' });
            elAddButton.append(
                utils.createElement(
                    'div', { class: 'rbroButton rbroPopupWindowButton' }, this.rb.getLabel('parameterAddTestData')));
            elAddButton.addEventListener('click', (event) => {
                this.addEmptyTestDataRow(tableBody, parentParameter, fields);
            });
            div.append(elAddButton);
        }
        utils.emptyElement(elRoot);
        elRoot.append(div);
    }

    addEmptyTestDataRow(tableBody, parentParameter, fields) {
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
        this.addTestDataRow(tableBody, parentParameter, fields, items, 0);
    }

    addTestDataRow(tableBody, parentParameter, fields, items, rowIndex) {
        const testData = items[rowIndex];
        const newRow = utils.createElement('tr');
        newRow.dataset.rowId = String(this.nextRowId);
        this.rowMap[String(this.nextRowId)] = { type: 'row', data: testData };
        this.nextRowId++;
        const elColumn = utils.createElement('td');
        if (parentParameter.type !== Parameter.type.map) {
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
            let data = (field.type === Parameter.type.array || field.type === Parameter.type.simpleArray) ? [] : '';
            if (testData !== null && field.name in testData) {
                data = testData[field.name];
            }
            this.appendColumn(newRow, field, data, testData, columnCount);
        }
        tableBody.append(newRow);
    }

    appendColumn(elRow, field, data, parentData, columnCount) {
        const elTd = utils.createElement('td');
        if (field.type === Parameter.type.array || field.type === Parameter.type.simpleArray ||
                field.type === Parameter.type.map) {
            const div = utils.createElement('div', { class: 'expandableCell rbroIcon-plus' });
            div.addEventListener('click', (event) => {
                const expand = !div.classList.contains('rbroExpandedCell');
                const nextEl = elRow.nextElementSibling;
                if (nextEl && nextEl.tagName === 'TR') {
                    const nestedTable = nextEl.querySelector('td table')
                    if (nestedTable) {
                        const elExpandableCells = elRow.querySelectorAll('.expandableCell');
                        for (const elExpandableCell of elExpandableCells) {
                            if (elExpandableCell.classList.contains('rbroExpandedCell')) {
                                elExpandableCell.classList.remove('rbroExpandedCell');
                                elExpandableCell.classList.remove('rbroIcon-minus');
                                elExpandableCell.classList.add('rbroIcon-plus');
                                // save test data before table is removed
                                parentData[field.name] = this.getTestData(nestedTable, field.parameter);
                                if (field.type === Parameter.type.array || field.type === Parameter.type.simpleArray) {
                                    const arrayLength = (field.name in parentData &&
                                        Array.isArray(parentData[field.name])) ? parentData[field.name].length : 0;
                                    this.setTableRowCount(div, arrayLength);
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
                    // get test data from parent data because data could have been updated in the meantime
                    const testData = parentData[field.name];
                    this.createTestDataTable(elTdNestedTable, field.parameter, testData);
                    elRowNestedTable.append(elTdNestedTable);
                    elRow.insertAdjacentElement('afterend', elRowNestedTable);
                    div.classList.remove('rbroIcon-plus');
                    div.classList.add('rbroExpandedCell');
                    div.classList.add('rbroIcon-minus');
                    div.textContent = '';
                }
            });
            if (field.type === Parameter.type.array || field.type === Parameter.type.simpleArray) {
                const arrayLength = (field.name in parentData && Array.isArray(parentData[field.name])) ?
                    parentData[field.name].length : 0;
                this.setTableRowCount(div, arrayLength);
            }
            elTd.append(div);
        } else {
            const input = utils.createElement('input');
            if (field.type === Parameter.type.boolean) {
                input.setAttribute('type', 'checkbox');
                if (data) {
                    input.checked = true;
                }
            } else {
                input.setAttribute('type', 'text');
                if (data) {
                    input.setAttribute('value', data);
                }
            }
            input.addEventListener('focus', (event) => {
                input.parentElement.classList.add('rbroHasFocus');
            });
            input.addEventListener('blur', (event) => {
                input.parentElement.classList.remove('rbroHasFocus');
            });

            if (field.type === Parameter.type.number) {
                utils.setInputDecimal(input);
            } else if (field.type === Parameter.type.date) {
                input.setAttribute('placeholder', this.rb.getLabel('parameterTestDataDatePattern'));
            }
            elTd.append(input);
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
        const fields = parentParameter.getParameterFields();
        let testData = null;
        if (parentParameter.type === Parameter.type.array || parentParameter.type === Parameter.type.simpleArray) {
            testData = [];
        } else if (parentParameter.type === Parameter.type.map) {
            testData = {};
        }
        let rows = elRoot.querySelector('tbody').children;
        for (let row of rows) {
            const rowMapEntry = this.rowMap[row.dataset.rowId];
            if (rowMapEntry.type === 'table') {
                // get data of nested table
                rowMapEntry.parentData[rowMapEntry.field.name] = this.getTestData(row, rowMapEntry.field.parameter);
            } else {
                const rowData = rowMapEntry.data;
                let inputs = row.querySelectorAll('input');
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
                        } else {
                            rowData[field.name] = input.value.trim();
                        }
                        i++;
                    }
                }
                if (parentParameter.type === Parameter.type.array ||
                        parentParameter.type === Parameter.type.simpleArray) {
                    testData.push(rowData);
                } else if (parentParameter.type === Parameter.type.map) {
                    // in case of map parameter there is only one row so we only return a map
                    // containing test data of this row
                    testData = rowData;
                }
            }
        }
        return testData;
    }

    /**
     * Sets row count for nested table.
     * A nested table is collapsed per default and can be expanded by click, if the table is collapsed
     * the row count is displayed.
     * @param {Element} elDiv - element to toggle displayed nested table.
     * @param {Number} arrayLength - array length of rows in nested table.
     */
    setTableRowCount(elDiv, arrayLength) {
        if (arrayLength === 0) {
            elDiv.textContent = this.rb.getLabel('parameterTestDataRowCountEmpty');
        } else if (arrayLength === 1) {
            elDiv.textContent = this.rb.getLabel('parameterTestDataRowCountOne');
        } else {
            elDiv.textContent = this.rb.getLabel('parameterTestDataRowCount').replace(
                '${count}', String(arrayLength));
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
    testData: 3
};
