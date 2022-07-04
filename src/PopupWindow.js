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
        this.parameters = null;
        this.visible = false;
        this.items = null;
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
     */
    show(items, objId, tagId, field, type, quill) {
        let winWidth = window.innerWidth;
        let winHeight = window.innerHeight;
        let elSearch = null;
        let quillSelectionRange = null;
        this.input = (tagId !== '') ? document.getElementById(tagId) : null;
        this.objId = objId;
        this.type = type;
        this.items = items;
        utils.emptyElement(this.elContent);
        //document.getElementById('rbro_background_overlay').remove();

        if (quill) {
            // save selection of rich text editor because selection is lost when editor looses focus
            quillSelectionRange = quill.getSelection();
        }

        if (type === PopupWindow.type.testData) {
            this.parameters = items[0];
            items.splice(0, 1);
            this.createTestDataTable(items);
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
            for (let item of items) {
                let li = utils.createElement('li');
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
                            let paramText = '${' + item.name + '}';
                            this.input.value = paramText;
                            this.input.dispatchEvent(new Event('input'));
                            autosize.update(this.input);
                            this.hide();
                        } else if (type === PopupWindow.type.parameterAppend) {
                            let paramText = '${' + item.name + '}';
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
            let offset = utils.getElementOffset(this.input);
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
                let testData = this.getTestData(null, -1);
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

    addTestDataRow(tableBody, parameters, testData) {
        let newRow = utils.createElement('tr');
        const elColumn = utils.createElement('td');
        const elDeleteButton = utils.createElement('div', { class: 'rbroButton rbroDeleteButton rbroIcon-cancel' });
        elDeleteButton.addEventListener('click', (event) => {
            event.target.parentElement.parentElement.remove();
        });
        elColumn.append(elDeleteButton);
        newRow.append(elColumn);
        for (let parameter of parameters) {
            if (parameter.allowMultiple && parameter.arraySize > 0) {
                let values = null;
                if (testData !== null && parameter.name in testData) {
                    values = testData[parameter.name];
                }
                for (let i=0; i < parameter.arraySize; i++) {
                    let data = '';
                    if (values && Array.isArray(values) && i < values.length) {
                        data = values[i];
                    }
                    this.appendColumn(newRow, parameter, data);
                }
            } else {
                let data = '';
                if (testData !== null && parameter.name in testData) {
                    data = testData[parameter.name];
                }
                if (parameter.allowMultiple && parameter.arraySize > 0 && Array.isArray(data)) {
                    for (let arrayItem of data) {
                        this.appendColumn(newRow, parameter, arrayItem);
                    }
                } else {
                    this.appendColumn(newRow, parameter, data);
                }
            }
        }
        tableBody.append(newRow);
    }

    appendColumn(row, parameter, data) {
        let input = utils.createElement('input', { type: 'text', value: data });
        input.addEventListener('focus', (event) => {
            input.parentElement.classList.add('rbroHasFocus');
        });
        input.addEventListener('blur', (event) => {
            input.parentElement.classList.remove('rbroHasFocus');
        });

        if (parameter.type === Parameter.type.number) {
            utils.setInputDecimal(input);
        } else if (parameter.type === Parameter.type.date) {
            input.setAttribute('placeholder', this.rb.getLabel('parameterTestDataDatePattern'));
        }
        const elTd = utils.createElement('td');
        elTd.append(input);
        row.append(elTd);
    }

    getTestData(excludeParameter, excludeParameterArrayItemIndex) {
        let testData = [];
        let rows = this.elContent.querySelector('tbody').querySelectorAll('tr');
        for (let row of rows) {
            let inputs = row.querySelectorAll('input');
            let rowData = {};
            let i = 0;
            for (let parameter of this.parameters) {
                if (parameter.allowMultiple && parameter.arraySize > 0) {
                    let fieldData = [];
                    for (let j=0; j < parameter.arraySize; j++) {
                        let input = inputs[i];
                        if (parameter !== excludeParameter || j !== excludeParameterArrayItemIndex) {
                            fieldData.push(input.value.trim());
                        }
                        i++;
                    }
                    rowData[parameter.name] = fieldData;
                } else {
                    let input = inputs[i];
                    rowData[parameter.name] = input.value.trim();
                    i++;
                }
            }
            testData.push(rowData);
        }
        return testData;
    }

    createTestDataTable(items) {
        let div = utils.createElement('div');
        let table = utils.createElement('table');
        let tableHeaderRow = utils.createElement('tr');
        let tableBody = utils.createElement('tbody');
        let i;
        tableHeaderRow.append(utils.createElement('th'));
        for (let parameter of this.parameters) {
            if (parameter.allowMultiple) {
                for (let arrayIndex=0; arrayIndex < parameter.arraySize; arrayIndex++) {
                    let th = utils.createElement('th');
                    th.append(utils.createElement('span', {}, `${parameter.name} ${arrayIndex + 1}`));
                    if (arrayIndex === 0) {
                        const elAddButton = utils.createElement(
                            'div', { class: 'rbroButton rbroRoundButton rbroIcon-plus' });
                        elAddButton.addEventListener('click', (event) => {
                            let testData = this.getTestData(null, -1);
                            parameter.arraySize++;
                            this.createTestDataTable(testData);
                        });
                        th.append(elAddButton);
                    } else {
                        const elRemoveButton = utils.createElement(
                            'div', { class: 'rbroButton rbroRoundButton rbroIcon-minus' });
                        elRemoveButton.addEventListener('click', (event) => {
                            let testData = this.getTestData(parameter, arrayIndex);
                            parameter.arraySize--;
                            this.createTestDataTable(testData);
                        });
                        th.append(elRemoveButton);
                    }
                    tableHeaderRow.append(th);
                }
            } else {
                tableHeaderRow.append(utils.createElement('th', {}, parameter.name));
            }
        }
        const elTableHeader = utils.createElement('thead');
        elTableHeader.append(tableHeaderRow);
        table.append(elTableHeader);
        if (items.length === 0) {
            this.addTestDataRow(tableBody, this.parameters, null);
        }
        for (i=0; i < items.length; i++) {
            this.addTestDataRow(tableBody, this.parameters, items[i]);
        }
        table.append(tableBody);
        div.append(table);
        const elAddButton = utils.createElement('div', { class: 'rbroButton rbroFullWidthButton' });
        elAddButton.append(
            utils.createElement(
                'div', { class: 'rbroButton rbroPopupWindowButton' }, this.rb.getLabel('parameterAddTestData')));
        elAddButton.addEventListener('click', (event) => {
            this.addTestDataRow(tableBody, this.parameters, null);
        });
        div.append(elAddButton);
        utils.emptyElement(this.elContent);
        this.elContent.append(div);
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
