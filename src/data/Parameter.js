import Command from '../commands/Command';
import SetValueCmd from '../commands/SetValueCmd';
import MainPanelItem from '../menu/MainPanelItem';
import * as utils from '../utils';

/**
 * Parameter data object. Contains all parameter settings including test data.
 * @class
 */
export default class Parameter {
    constructor(id, initialData, rb) {
        this.rb = rb;
        this.id = id;
        this.name = rb.getLabel('parameter');
        this.panelItem = null;
        this.errors = [];
        
        this.type = Parameter.type.string;
        this.arrayItemType = Parameter.type.string;
        this.eval = !rb.getProperty('adminMode');  // if false value comes from database
        this.nullable = false;
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

    /**
     * Called after initialization is finished.
     */
    setup() {
        if (this.type === Parameter.type.array || this.type === Parameter.type.map) {
            for (let child of this.children) {
                let parameter = new Parameter(child.id || this.rb.getUniqueId(), child, this.rb);
                this.rb.addParameter(parameter);
                let panelItem = new MainPanelItem('parameter', '',
                    this.panelItem, parameter, { hasChildren: true, showAdd: this.editable, showDelete: this.editable, draggable: true },
                    this.rb);
                parameter.setPanelItem(panelItem);
                this.panelItem.appendChild(panelItem);
                parameter.setup();
                this.rb.notifyEvent(parameter, Command.operation.add);
            }
        }
    }

    /**
     * Returns all data fields of this object. The fields are used when serializing the object.
     * @returns {String[]}
     */
    getFields() {
        return ['id', 'name', 'type', 'arrayItemType', 'eval', 'nullable', 'pattern', 'expression', 'showOnlyNameType', 'testData'];
    }

    getId() {
        return this.id;
    }

    /**
     * Returns highest id of this component including all its child components.
     * @returns {Number}
     */
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

    /**
     * Returns parent in case parameter is child of a map/array parameter.
     * @returns {[Parameter]} parent parameter if available, null otherwise.
     */
    getParent() {
        if (this.panelItem !== null && this.panelItem.getParent().getData() instanceof Parameter) {
            return this.panelItem.getParent().getData();
        }
        return null;
    }

    /**
     * Returns the full parameter name.
     * In case parameter is child of a map/array parameter the returned name is parentName.name, otherwise only name.
     * @param {[String]} parentName - use this name for parent instead of current parent name. If null the
     * current parent name is used.
     * @param {[String]} name - use this name for the parameter instead of current name. If null the
     * current parameter name is used.
     * @returns {String}
     */
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

    /**
     * Adds SetValue commands to command group parameter in case the specified parameter is used in any of
     * the object fields.
     * @param {String} oldParameterName
     * @param {String} newParameterName
     * @param {CommandGroupCmd} cmdGroup - possible SetValue commands will be added to this command group.
     */
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

    /**
     * Update test data for arrays. Adapt field names of list items so test data is still valid when a
     * parameter of a list item is renamed.
     * @param {String} oldParameterName
     * @param {String} newParameterName
     * @param {CommandGroupCmd} cmdGroup - possible SetValue command will be added to this command group.
     */
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

    /**
     * In case of map parameter all child parameters are appended, for other parameter types the
     * parameter itself is appended. Parameters with type array are only added if explicitly
     * specified in allowedTypes parameter.
     * Used for parameter popup window.
     * @param {Object[]} parameters - list where parameter items will be appended to.
     * @param {String[]} allowedTypes - specify allowed parameter types which will be added to the
     * parameter list. If not set all parameter types are allowed.
     */
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
        } else if (Array.isArray(allowedTypes) && allowedTypes.indexOf(this.type) !== -1) {
            // add array parameter only if explicitly specified in allowedTypes
            parameters.push({ name: this.name, description: '' });
        }
    }

    /**
     * Appends field parameters of array parameter.
     * Used for parameter popup window of sum/average expression field.
     * @param {Object[]} parameters - list where parameter items will be appended to.
     * @param {String} fieldType - allowed parameter type which will be added to the
     * parameter list. If empty all parameter types are allowed.
     */
    appendFieldParameterItems(parameters, fieldType) {
        if (this.type === Parameter.type.array) {
            for (let child of this.panelItem.getChildren()) {
                let parameter = child.getData();
                if (!fieldType || parameter.getValue('type') === fieldType) {
                    parameters.push({ name: this.name + '.' + parameter.getName(), description: '' });
                }
            }
        }
    }

    /**
     * Returns test data of array parameter as array.
     * @param {Boolean} includeFieldInfo - if true a row containing info about the fields will be inserted
     * in the returned rows (first row).
     * @returns {[Object[]]} rows of test data. Null in case parameter is not an array.
     */
    getTestDataRows(includeFieldInfo) {
        if (this.type !== Parameter.type.array && this.type !== Parameter.type.simpleArray) {
            return null;
        }
        let fields = [];
        if (this.type === Parameter.type.simpleArray) {
            let fieldInfo = { name: 'data', type: this.arrayItemType, allowMultiple: false };
            fields.push(fieldInfo);
        } else {
            for (let child of this.getChildren()) {
                let fieldInfo = { name: child.getName() };
                if (child.getValue('type') === Parameter.type.simpleArray) {
                    fieldInfo.type = child.getValue('arrayItemType');
                    fieldInfo.allowMultiple = true;
                    fieldInfo.arraySize = 1;
                } else {
                    fieldInfo.type = child.getValue('type');
                    fieldInfo.allowMultiple = false;
                }
                fields.push(fieldInfo);
            }
        }
        let rows = [];
        if (fields.length > 0) {
            if (includeFieldInfo) {
                rows.push(fields);
            }
            try {
                let testData = JSON.parse(this.testData);
                if (Array.isArray(testData)) {
                    for (let row of testData) {
                        let itemRow = {};
                        let hasData = false;
                        for (let field of fields) {
                            if (field.name in row) {
                                let fieldData = row[field.name];
                                if((field.allowMultiple && Array.isArray(fieldData)) ||
                                        (!field.allowMultiple && !Array.isArray(fieldData))) {
                                    hasData = true;
                                    itemRow[field.name] = fieldData;
                                    if (field.allowMultiple && fieldData.length > 0) {
                                        field.arraySize = fieldData.length;
                                    }
                                }
                            }
                        }
                        if (hasData) {
                            rows.push(itemRow);
                        }
                    }
                }
            } catch (e) {
            }
        }
        return rows;
    }
}

Parameter.type = {
    'none': 'none',
    'string': 'string',
    'number': 'number',
    'boolean': 'boolean',
    'date': 'date',
    'image': 'image',
    'array': 'array',
    'simpleArray': 'simple_array',
    'map': 'map',
    'sum': 'sum',
    'average': 'average'
};
