import SetValueCmd from './commands/SetValueCmd';
import Parameter from './data/Parameter';
import * as utils from './utils';

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
        this.elWindow = $('<div class="rbroPopupWindow rbroHidden"></div>');
        this.elContent = $('<div class="rbroPopupWindowContent"></div>')
            .mouseup(event => {
                // stop propagation so popup window is not closed
                event.stopPropagation();
            });
        this.elWindow.append(this.elContent);
        let btn = $('<div class="rbroButton rbroRoundButton rbroPopupWindowCancel rbroIcon-cancel"></div>')
            .click(event => {
                this.hide();
            });
        this.elWindow.append(btn);
        $('body').append(this.elWindow);
    }

    /**
     * Shows a popup window for the given items.
     * @param {Object[]} items - items to display in the popup window. Each item must contain a name (String), and
     * optional a description (String) and separator (Boolean). If separator is true the item is not selectable.
     * @param {String} objId - id of data object where the field belongs to.
     * @param {String} tagId - id of DOM element in the panel for the given field. In case of empty string there is no
     * input element available.
     * @param {String} field - field of data object where selected item will be written into.
     * @param {PopupWindow.type} type
     */
    show(items, objId, tagId, field, type) {
        let winWidth = $(window).width();
        let winHeight = $(window).height();
        let elSearch = null;
        this.input = (tagId !== '') ? $('#' + tagId) : null;
        this.objId = objId;
        this.type = type;
        this.items = items;
        this.elContent.empty();
        $('#rbro_background_overlay').remove();
        if (type === PopupWindow.type.testData) {
            this.parameters = items[0];
            items.splice(0, 1);
            this.createTestDataTable(items);
            let width = Math.round(winWidth * 0.8);
            let height = Math.round(winHeight * 0.8);
            this.elWindow.css({ left: Math.round((winWidth - width) / 2) + 'px', top: Math.round((winHeight - height) / 2) + $(window).scrollTop() + 'px',
                    width: width + 'px', height: height + 'px' });
            $('body').append($('<div id="rbro_background_overlay" class="rbroBackgroundOverlay"></div>'));
            $('body').addClass('rbroFixedBackground'); // no scroll bars for background while popup is shown
        } else {
            if (type === PopupWindow.type.parameterSet || type === PopupWindow.type.parameterAppend) {
                elSearch = $(`<input class="rbroPopupSearch" placeholder="${this.rb.getLabel('parameterSearchPlaceholder')}">`)
                    .on('input', event => {
                        this.filterParameters(elSearch.val());
                    });
                this.elContent.append(elSearch);
            }
            let ul = $('<ul></ul>')
                .mousedown(event => {
                    // prevent default so blur event of input is not triggered,
                    // otherwise popup window would be closed before click event handler of selected
                    // item is triggered
                    event.preventDefault();
                });
            for (let item of items) {
                let li = $('<li></li>');
                if (item.separator) {
                    if ((type === PopupWindow.type.parameterSet ||
                            type === PopupWindow.type.parameterAppend) && item.id) {
                        li.attr('id', 'parameter_group_' + item.id);
                    }
                    let separatorClass = 'rbroPopupItemSeparator';
                    if (item.separatorClass) {
                        separatorClass += ' ' + item.separatorClass;
                    }
                    li.attr('class', separatorClass);
                } else {
                    if ((type === PopupWindow.type.parameterSet ||
                            type === PopupWindow.type.parameterAppend) && item.id) {
                        li.attr('id', 'parameter_' + item.id);
                    }
                    li.mousedown(event => {
                        if (type === PopupWindow.type.pattern) {
                            this.input.val(item.name);
                            this.input.trigger('input');
                            this.hide();
                        } else if (type === PopupWindow.type.parameterSet) {
                            let paramText = '${' + item.name + '}';
                            this.input.val(paramText);
                            this.input.trigger('input');
                            autosize.update(this.input);
                            this.hide();
                        } else if (type === PopupWindow.type.parameterAppend) {
                            let paramText = '${' + item.name + '}';
                            utils.insertAtCaret(this.input.get(0), paramText);
                            autosize.update(this.input);
                            this.input.trigger('input');
                            this.hide();
                        }
                        event.preventDefault();
                    });
                }
                li.append(`<div class="rbroPopupItemHeader">${item.name}</div>`);
                if (item.description && item.description !== '') {
                    li.append(`<div class="rbroPopupItemDescription">${item.description}</div>`);
                }
                ul.append(li);
            }
            this.elContent.append(ul);
            let offset = this.input.offset();
            let top = offset.top;
            // test if popup window should be shown above or below input field
            if (top < (winHeight / 2) || top < 300) {
                // make sure there is enough space for popup below input, otherwise just show it over input field
                if ((top + this.input.height() + 300) < winHeight) {
                    top += this.input.height();
                }
            } else {
                top -= 300;
            }
            this.elWindow.css({ left: offset.left + 'px', top: top + 'px', width: '400px', height: '300px' });
        }

        this.elWindow.removeClass('rbroHidden');
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
                    let cmd = new SetValueCmd(this.objId, 'rbro_parameter_test_data', 'testData',
                        testDataStr, SetValueCmd.type.text, this.rb);
                    this.rb.executeCommand(cmd);
                }
                $('#rbro_background_overlay').remove();
            }
            this.elWindow.addClass('rbroHidden');
            this.elContent.empty();
            $('body').removeClass('rbroFixedBackground');
            this.visible = false;
            this.items = null;
        }
    }

    addTestDataRow(tableBody, parameters, testData) {
        let newRow = $('<tr></tr>');
        newRow.append($('<td></td>').append($('<div class="rbroButton rbroDeleteButton rbroIcon-cancel"></div>')
            .click(event => {
                $(event.target).parent().parent().remove();
            })
        ));
        for (let parameter of parameters) {
            if (parameter.allowMultiple && parameter.arraySize > 0) {
                let values = null;
                if (testData !== null && parameter.name in testData) {
                    values = testData[parameter.name];
                }
                for (let i=0; i < parameter.arraySize; i++) {
                    let data = '';
                    if (Array.isArray(values) && i < values.length) {
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
        let input = $(`<input type="text" value="${data}">`)
            .focus(event => {
                input.parent().addClass('rbroHasFocus');
            })
            .blur(event => {
                input.parent().removeClass('rbroHasFocus');
            });

        if (parameter.type === Parameter.type.number) {
            utils.setInputDecimal(input);
        } else if (parameter.type === Parameter.type.date) {
            input.attr('placeholder', this.rb.getLabel('parameterTestDataDatePattern'));
        }
        row.append($('<td></td>').append(input));
    }

    getTestData(excludeParameter, excludeParameterArrayItemIndex) {
        let testData = [];
        let rows = this.elContent.find('tbody').find('tr');
        for (let row of rows) {
            let inputs = $(row).find('input');
            let rowData = {};
            let i = 0;
            for (let parameter of this.parameters) {
                if (parameter.allowMultiple && parameter.arraySize > 0) {
                    let fieldData = [];
                    for (let j=0; j < parameter.arraySize; j++) {
                        let input = inputs.eq(i);
                        if (parameter !== excludeParameter || j !== excludeParameterArrayItemIndex) {
                            fieldData.push(input.val().trim());
                        }
                        i++;
                    }
                    rowData[parameter.name] = fieldData;
                } else {
                    let input = inputs.eq(i);
                    rowData[parameter.name] = input.val().trim();
                    i++;
                }
            }
            testData.push(rowData);
        }
        return testData;
    }

    createTestDataTable(items) {
        let div = $('<div></div>');
        let table = $('<table></table>');
        let tableHeaderRow = $('<tr></tr>');
        let tableBody = $('<tbody></tbody>');
        let i;
        tableHeaderRow.append('<th></th>');
        for (let parameter of this.parameters) {
            if (parameter.allowMultiple) {
                for (let arrayIndex=0; arrayIndex < parameter.arraySize; arrayIndex++) {
                    let th = $('<th></th>');
                    th.append($(`<span>${parameter.name} ${arrayIndex + 1}</span>`));
                    if (arrayIndex === 0) {
                        th.append($(`<div class="rbroButton rbroRoundButton rbroIcon-plus"></div>`)
                            .click(event => {
                                let testData = this.getTestData(null, -1);
                                parameter.arraySize++;
                                this.createTestDataTable(testData);
                            })
                        );
                    } else {
                        th.append($(`<div class="rbroButton rbroRoundButton rbroIcon-minus"></div>`)
                            .click(event => {
                                let testData = this.getTestData(parameter, arrayIndex);
                                parameter.arraySize--;
                                this.createTestDataTable(testData);
                            })
                        );
                    }
                    tableHeaderRow.append(th);
                }
            } else {
                tableHeaderRow.append(`<th>${parameter.name}</th>`);
            }
        }
        table.append($('<thead></thead>').append(tableHeaderRow));
        if (items.length === 0) {
            this.addTestDataRow(tableBody, this.parameters, null);
        }
        for (i=0; i < items.length; i++) {
            this.addTestDataRow(tableBody, this.parameters, items[i]);
        }
        table.append(tableBody);
        div.append(table);
        div.append($(`<div class="rbroFullWidthButton"><div class="rbroButton rbroPopupWindowButton">${this.rb.getLabel('parameterAddTestData')}</div></div>`)
            .click(event => {
                this.addTestDataRow(tableBody, this.parameters, null);
            })
        );
        this.elContent.empty().append(div);
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
                        // hide groups (data source parameters and parameter maps) if they do not contain any visible items
                        if (groupCount > 0) {
                            $('#parameter_group_' + currentGroupId).show();
                        } else {
                            $('#parameter_group_' + currentGroupId).hide();
                        }
                    }
                    currentGroupId = item.id ? item.id : null;
                    groupCount = 0;
                } else {
                    if (item.nameLowerCase.indexOf(searchVal) !== -1) {
                        $('#parameter_' + item.id).show();
                        if (currentGroupId !== -1) {
                            groupCount++;
                        }
                    } else {
                        $('#parameter_' + item.id).hide();
                    }
                }
            }
            if (currentGroupId !== null) {
                if (groupCount > 0) {
                    $('#parameter_group_' + currentGroupId).show();
                } else {
                    $('#parameter_group_' + currentGroupId).hide();
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
