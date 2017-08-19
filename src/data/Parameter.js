import Command from '../commands/Command';
import SetValueCmd from '../commands/SetValueCmd';
import MainPanelItem from '../menu/MainPanelItem';
import * as utils from '../utils';

export default class Parameter {
    constructor(id, initialData, rb) {
        this.rb = rb;
        this.id = id;
        this.name = rb.getLabel('parameter');
        this.panelItem = null;
        this.errors = [];
        
        this.type = Parameter.type.string;
        this.eval = !rb.getProperty('adminMode');  // if false value comes from database
        this.pattern = '';
        this.expression = '';
        this.testData = '';
        this.children = [];
        this.editable = rb.getProperty('adminMode');
        this.showOnlyNameType = false;
        this.setInitialData(initialData);
    }

    setInitialData(initialData) {
        for (let key in initialData) {
            if (initialData.hasOwnProperty(key) && this.hasOwnProperty(key)) {
                this[key] = initialData[key];
            }
        }
        if ('showOnlyNameType' in initialData && initialData['showOnlyNameType']) {
            this.editable = false;
        }
    }

    setup() {
        if (this.type === Parameter.type.array || this.type === Parameter.type.map) {
            for (let child of this.children) {
                let parameter = new Parameter(child.id || this.rb.getUniqueId(), child, this.rb);
                this.rb.addParameter(parameter);
                let panelItem = new MainPanelItem('parameter', 'parameter', '',
                    this.panelItem, parameter, { hasChildren: true, showAdd: this.editable, showDelete: this.editable, draggable: true },
                    this.rb);
                parameter.setPanelItem(panelItem);
                this.panelItem.appendChild(panelItem);
                parameter.setup();
                this.rb.notifyEvent(parameter, Command.operation.add);
            }
        }
    }

    getFields() {
        return ['id', 'name', 'type', 'eval', 'pattern', 'expression', 'showOnlyNameType', 'testData'];
    }

    getId() {
        return this.id;
    }

    // highest id of this component including all its child components
    getMaxId() {
        let maxId = this.id;
        if (this.type === Parameter.type.array || this.type === Parameter.type.map) {
            for (let child of this.children) {
                if (child.id > maxId) {
                    maxId = child.id;
                }
            }
        }
        return maxId;
    }

    getName() {
        return this.name;
    }

    getPanelItem() {
        return this.panelItem;
    }

    setPanelItem(panelItem) {
        this.panelItem = panelItem;
    }

    getValue(field) {
        return this[field];
    }

    setValue(field, value, elSelector, isShown) {
        this[field] = value;
        if (field === 'type') {
            if (isShown && value === Parameter.type.date) {
                $('#rbro_parameter_test_data').attr('placeholder', this.rb.getLabel('parameterTestDataDatePattern'));
            } else {
                $('#rbro_parameter_test_data').attr('placeholder', '');
            }
        }
    }

    getParent() {
        if (this.panelItem !== null && this.panelItem.getParent().getData() instanceof Parameter) {
            return this.panelItem.getParent().getData();
        }
        return null;
    }

    // in case parameter is child of collection the returned name is parentName.name, otherwise only name.
    // if parentName or name is not null then it is used instead of current parentName/name.
    getFullName(parentName, name) {
        if (name === null) {
            name = this.getName();
        }
        let parent = this.getParent();
        if (parent !== null) {
            if (parentName === null) {
                parentName = parent.getName();
            }
            return parentName + '.' + name;
        }
        return name;
    }

    addError(error) {
        this.errors.push(error);
    }

    clearErrors() {
        this.errors = [];
    }

    getErrors() {
        return this.errors;
    }

    remove() {
    }

    select() {
    }

    deselect() {
    }

    addCommandsForChangedParameter(oldParameterName, newParameterName, cmdGroup) {
        if (this.expression.indexOf(oldParameterName) !== -1) {
            let cmd = new SetValueCmd(this.id, 'rbro_parameter_expression', 'expression',
                utils.replaceAll(this.expression, oldParameterName, newParameterName), SetValueCmd.type.text, this.rb);
            cmdGroup.addCommand(cmd);
        }
        for (let child of this.getChildren()) {
            child.addCommandsForChangedParameter(oldParameterName, newParameterName, cmdGroup);
        }
    }

    // update test data for arrays: adapt field names of list items so test data is still valid when a
    // parameter of a list item is renamed
    addUpdateTestDataCmdForChangedParameter(oldParameter, newParameter, cmdGroup) {
        if (this.type === Parameter.type.array) {
            let rows = [];
            try {
                let testData = JSON.parse(this.testData);
                if (Array.isArray(testData)) {
                    for (let row of testData) {
                        let itemRow = {};
                        for (let val in row) {
                            if (row.hasOwnProperty(val)) {
                                if (val === oldParameter) {
                                    itemRow[newParameter] = row[val];
                                } else {
                                    itemRow[val] = row[val];
                                }
                            }
                        }
                        rows.push(itemRow);
                    }
                }
                let testDataStr = JSON.stringify(rows);
                if (this.testData !== testDataStr) {
                    let cmd = new SetValueCmd(this.id, 'rbro_parameter_test_data', 'testData',
                        testDataStr, SetValueCmd.type.text, this.rb);
                    cmdGroup.addCommand(cmd);
                }
            } catch (e) {
            }
        }
    }

    toJS() {
        let ret = {};
        for (let field of this.getFields()) {
            ret[field] = this.getValue(field);
        }
        if (this.type === Parameter.type.array || this.type === Parameter.type.map) {
            let children = [];
            for (let child of this.panelItem.getChildren()) {
                children.push(child.getData().toJS());
            }
            ret.children = children;
        }
        return ret;
    }

    getChildren() {
        let children = [];
        if (this.type === Parameter.type.array || this.type === Parameter.type.map) {
            for (let child of this.panelItem.getChildren()) {
                children.push(child.getData());
            }
        }
        return children;
    }

    appendParameterItems(parameters, allowedTypes) {
        if (this.type === Parameter.type.map) {
            let parametersToAppend = [];
            if (Array.isArray(allowedTypes)) {
                for (let child of this.getChildren()) {
                    if (allowedTypes.indexOf(child.type) !== -1) {
                        parametersToAppend.push(child);
                    }
                }
            } else {
                parametersToAppend = this.getChildren();
            }
            if (parametersToAppend.length > 0) {
                parameters.push({ separator: true, separatorClass: 'rbroParameterGroup', name: this.name });
            }
            for (let parameter of parametersToAppend) {
                parameters.push({ name: this.name + '.' + parameter.getName(), description: '' });
            }
        } else if (this.type !== Parameter.type.array) {
            if (!Array.isArray(allowedTypes) || allowedTypes.indexOf(this.type) !== -1) {
                parameters.push({ name: this.name, description: '' });
            }
        }
    }

    appendFieldParameterItems(parameters, fieldType) {
        if (this.type === Parameter.type.map || this.type === Parameter.type.array) {
            for (let child of this.panelItem.getChildren()) {
                let parameter = child.getData();
                if (!fieldType || parameter.getValue('type') === fieldType) {
                    parameters.push({ name: this.name + '.' + parameter.getName(), description: '' });
                }
            }
        }
    }

    getTestDataRows() {
        if (this.type !== Parameter.type.array) {
            return null;
        }
        let availableFields = {};
        for (let child of this.getChildren()) {
            availableFields[child.getName()] = true;
        }
        let rows = [];
        try {
            let testData = JSON.parse(this.testData);
            if (Array.isArray(testData)) {
                for (let row of testData) {
                    let itemRow = {};
                    let hasData = false;
                    for (let val in row) {
                        if (val in availableFields) {
                            hasData = true;
                            itemRow[val] = row[val];
                        }
                    }
                    if (hasData) {
                        rows.push(itemRow);
                    }
                }
            }
        } catch (e) {
        }
        return rows;
    }
}

Parameter.type = {
    'none': 'none',
    'string': 'string',
    'number': 'number',
    'date': 'date',
    'image': 'image',
    'array': 'array',
    'map': 'map',
    'sum': 'sum',
    'average': 'average'
};
