import AddDeleteParameterCmd from '../commands/AddDeleteParameterCmd';
import Command from '../commands/Command';
import SetValueCmd from '../commands/SetValueCmd';
import MainPanelItem from '../menu/MainPanelItem';

/**
 * Parameter data object. Contains all parameter settings including test data.
 * @class
 */
export default class Parameter {

    static dateRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})( (\d{1,2}):(\d{2})(:(\d{2}))?)?$/;

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
        this.testDataBoolean = false;
        this.testDataImage = '';
        this.testDataImageFilename = '';
        this.testDataRichText = '';
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

    setHighlightUnused(highlightUnused) {
        if (highlightUnused) {
            document.getElementById(`rbro_menu_item${this.panelItem.getId()}`).classList.add('rbroUnusedParameter');
        } else {
            document.getElementById(`rbro_menu_item${this.panelItem.getId()}`).classList.remove('rbroUnusedParameter');
        }
    }

    /**
     * Called after initialization is finished.
     */
    setup() {
        if (this.type === Parameter.type.array || this.type === Parameter.type.map) {
            const adminMode = this.rb.getProperty('adminMode');
            for (let child of this.children) {
                let parameter = new Parameter(child.id || this.rb.getUniqueId(), child, this.rb);
                this.rb.addParameter(parameter);
                const showOnlyNameType = parameter.getValue('showOnlyNameType');
                const showAddDelete = adminMode && !showOnlyNameType;
                // in case children and add/delete buttons exist: the visibility depends on parameter
                // type which can be modified (e.g. map and list have children and add button) and
                // is updated dynamically
                let panelItem = new MainPanelItem(
                    'parameter', this.panelItem, parameter, {
                        hasChildren: !showOnlyNameType, showAdd: showAddDelete, showDelete: showAddDelete,
                        draggable: true }, this.rb);
                parameter.setPanelItem(panelItem);
                this.panelItem.appendChild(panelItem);
                parameter.setup();
                this.rb.notifyEvent(parameter, Command.operation.add);
            }
        }
        this.updateMenuItemDisplay();
    }

    /**
     * Return true if parameter is a function with range input.
     */
    isRangeFunction() {
        return this.type === Parameter.type.average || this.type === Parameter.type.sum;
    }

    /**
     * Returns all data fields of this object. The fields are used when serializing the object.
     * @returns {String[]}
     */
    getFields() {
        const fields = this.getProperties();
        fields.splice(0, 0, 'id');
        return fields;
    }

    /**
     * Returns all fields of this object that can be modified in the properties panel.
     * @returns {String[]}
     */
    getProperties() {
        return [
            'name', 'type', 'arrayItemType', 'eval', 'nullable', 'pattern', 'expression',
            'showOnlyNameType', 'testData', 'testDataBoolean', 'testDataImage', 'testDataImageFilename',
            'testDataRichText',
        ];
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
            const children = this.children.slice();
            let i = 0;
            while ( i < children.length) {
                const child = children[i];
                if (child.id > maxId) {
                    maxId = child.id;
                }
                if (child.type === Parameter.type.array || child.type === Parameter.type.map) {
                    children.push(...child.children);
                }
                i++;
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

    setValue(field, value) {
        this[field] = value;
        if (field === 'type') {
            this.updateMenuItemDisplay();
        }
    }

    /**
     * Returns value to use for updating input control.
     * Can be overridden in case update value can be different from internal value, e.g.
     * width for table cells with colspan > 1.
     * @param {String} field - field name.
     * @param {String} value - value for update.
     */
    getUpdateValue(field, value) {
        return value;
    }

    /**
     * Updates visibility of menu panel item (buttons, children) for this parameter.
     *
     * Must be called initially and when parameter type changes.
     */
    updateMenuItemDisplay() {
        // for parameters where only name and type are shown (showOnlyNameType == true)
        // there are no buttons for add / delete and toggle children (e.g. page_count, page_number)
        if (this.rb.getProperty('adminMode') && !this.showOnlyNameType) {
            if (this.type === Parameter.type.array || this.type === Parameter.type.map) {
                document.getElementById(`rbro_menu_item_add${this.getId()}`).removeAttribute('style');
                document.getElementById(`rbro_menu_item_children${this.getId()}`).style.display = 'block';
                document.getElementById(`rbro_menu_item_children_toggle${this.getId()}`).removeAttribute('style');
            } else {
                document.getElementById(`rbro_menu_item_add${this.getId()}`).style.display = 'none';
                document.getElementById(`rbro_menu_item_children${this.getId()}`).style.display = 'none';
                document.getElementById(`rbro_menu_item_children_toggle${this.getId()}`).style.display = 'none';
            }
        }
    }

    /**
     * Returns parent in case parameter is child of a map/array parameter.
     * @returns {?Parameter} parent parameter if available, null otherwise.
     */
    getParent() {
        if (this.panelItem !== null && this.panelItem.getParent().getData() instanceof Parameter) {
            return this.panelItem.getParent().getData();
        }
        return null;
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
     * @param {Parameter} parameter - parameter which will be renamed.
     * @param {String} newParameterName - new name of the parameter.
     * @param {CommandGroupCmd} cmdGroup - possible SetValue commands will be added to this command group.
     */
    addCommandsForChangedParameterName(parameter, newParameterName, cmdGroup) {
        this.addCommandForChangedParameterName(parameter, newParameterName, 'expression', cmdGroup);
        for (let child of this.getChildren()) {
            child.addCommandsForChangedParameterName(parameter, newParameterName, cmdGroup);
        }
    }

    /**
     * Adds SetValue command to command group parameter in case the specified parameter is used in the
     * specified object field.
     * @param {Parameter} parameter - parameter which will be renamed.
     * @param {String} newParameterName - new name of the parameter.
     * @param {String} field
     * @param {CommandGroupCmd} cmdGroup - possible SetValue command will be added to this command group.
     */
    addCommandForChangedParameterName(parameter, newParameterName, field, cmdGroup) {
        let paramParent = parameter.getParent();
        let paramRef;
        let newParamRef;
        if (paramParent !== null && paramParent.getValue('type') === Parameter.type.map) {
            paramRef = '${' + paramParent.getName() + '.' + parameter.getName() + '}';
            newParamRef = '${' + paramParent.getName() + '.' + newParameterName + '}';
        } else if (parameter.getValue('type') === Parameter.type.map) {
            paramRef = '${' + parameter.getName() + '.';
            newParamRef = '${' + newParameterName + '.';
        } else {
            paramRef = '${' + parameter.getName() + '}';
            newParamRef = '${' + newParameterName + '}';
        }

        if (this.getValue(field).indexOf(paramRef) !== -1) {
            let cmd = new SetValueCmd(
                this.id, field, this.getValue(field).replaceAll(paramRef, newParamRef),
                SetValueCmd.type.text, this.rb);
            cmdGroup.addCommand(cmd);
        }
    }

    /**
     * Update test data for arrays and maps. Adapt field names of list items so test data is still valid when a
     * parameter of a list item is renamed.
     * @param {String} newParameterName
     * @param {Parameter[]} parents
     * @param {CommandGroupCmd} cmdGroup - possible SetValue command will be added to this command group.
     */
    addUpdateTestDataCmdForChangedParameterName(newParameterName, parents, cmdGroup) {
        const rootParent = (parents.length > 0) ? parents[0] : null;
        if (rootParent !== null &&
                (rootParent.type === Parameter.type.array || rootParent.type === Parameter.type.map)) {
            // update test data of root parameter because test data is only set for root parameters
            try {
                const testData = rootParent.getTestData(true);
                this.renameTestDataParameter(testData, this.getName(), newParameterName, parents, 0);
                let updatedTestData = JSON.stringify(testData);
                if (this.testData !== updatedTestData) {
                    let cmd = new SetValueCmd(
                        rootParent.getId(), 'testData', updatedTestData, SetValueCmd.type.text, this.rb);
                    cmdGroup.addCommand(cmd);
                }
            } catch (e) {
            }
        }
    }

    renameTestDataParameter(testData, oldParameterName, newParameterName, parents, parentLevel) {
        const nextParentLevel = parentLevel + 1;
        const hasNextParent = (nextParentLevel < parents.length);
        const compareName = hasNextParent ? parents[nextParentLevel].getName() : oldParameterName;
        for (const testDataRow of testData) {
            if (compareName in testDataRow) {
                if (hasNextParent) {
                    this.renameTestDataParameter(
                        testDataRow[compareName], oldParameterName, newParameterName, parents, nextParentLevel);
                } else {
                    testDataRow[newParameterName] = testDataRow[compareName];
                    delete testDataRow[compareName];
                }
            }
        }
    }

    /**
     * Adds AddDeleteParameterCmd to command group parameter in case the
     * parameter type was changed from/to array. The command will add/delete the internal
     * 'row_number' parameter which is available for array parameters.
     * @param {String} newParameterType - new type of the parameter.
     * @param {CommandGroupCmd} cmdGroup - possible AddDeleteParameterCmd command will
     * be added to this command group.
     */
    addCommandsForChangedParameterType(newParameterType, cmdGroup) {
        if (this.type === Parameter.type.array || this.type === Parameter.type.simpleArray ||
                this.type === Parameter.type.map ||
                newParameterType === Parameter.type.array || newParameterType === Parameter.type.simpleArray ||
                newParameterType === Parameter.type.map) {
            // clear test data if parameter type is changed from or to array / simpleArray / map, the test data
            // is saved in the same field but the test data format is different depending on the parameter type
            const cmd = new SetValueCmd(this.getId(), 'testData', '', SetValueCmd.type.text, this.rb);
            cmdGroup.addCommand(cmd);
        }

        if (this.type !== Parameter.type.array && newParameterType === Parameter.type.array) {
            let initialData = {
                name: 'row_number', type: Parameter.type.number, eval: false, editable: false,
                showOnlyNameType: true
            };
            let cmd = new AddDeleteParameterCmd(true, initialData, this.rb.getUniqueId(), this.getId(), 0, this.rb);
            cmdGroup.addCommand(cmd);
        } else if (this.type === Parameter.type.array && newParameterType !== Parameter.type.array) {
            let children = this.getChildren();
            for (let child of children) {
                if (child.getValue('name') === 'row_number' && !child.getValue('editable')) {
                    let cmd = new AddDeleteParameterCmd(
                        false, child.toJS(), child.getId(), this.getId(),
                        child.getPanelItem().getSiblingPosition(), this.rb);
                    cmdGroup.addCommand(cmd);
                    break;
                }
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
     * In case of map parameter all child parameters are appended,
     * for other parameter types the parameter itself is appended.
     * Parameters with type array are only added if explicitly specified
     * in allowedTypes parameter. Nested map parameters (map parameter inside map) are
     * also possible.
     *
     * Used for parameter popup window.
     *
     * @param {Object[]} parameters - list where parameter items will be appended to.
     * @param {?String[]} allowedTypes - specify allowed parameter types which will be
     * added to the parameter list. If not set all parameter types are allowed.
     * @param {?String} dataSourceName - data source name which will be set as prefix for inserted parameter name.
     */
    appendParameterItems(parameters, allowedTypes, dataSourceName) {
        this.appendParameterItemsWithPrefix(parameters, allowedTypes, dataSourceName, '');
    }

    appendParameterItemsWithPrefix(parameters, allowedTypes, dataSourceName, parameterPrefix) {
        if (this.type === Parameter.type.map) {
            const parametersToAppend = [];
            const nestedMapParameters = [];
            for (const child of this.getChildren()) {
                if (child.type === Parameter.type.map) {
                    nestedMapParameters.push(child);
                } else if (child.isAllowed(allowedTypes)) {
                    parametersToAppend.push(child);
                }
            }
            if (parametersToAppend.length > 0) {
                parameters.push({
                    separator: true, id: this.id,
                    separatorClass: 'rbroParameterGroup', name: parameterPrefix + this.name });
                for (const parameter of parametersToAppend) {
                    const paramName = parameterPrefix + this.name + '.' + parameter.getName();
                    parameters.push({
                        name: paramName, nameLowerCase: paramName.toLowerCase(),
                        id: parameter.getId(), description: '',
                        dataSourceName: dataSourceName });
                }
            }
            // append nested map parameters after other parameters of the map
            for (const nestedMapParameter of nestedMapParameters) {
                nestedMapParameter.appendParameterItemsWithPrefix(
                    parameters, allowedTypes, dataSourceName, parameterPrefix + this.name + '.');
            }
        } else if (this.isAllowed(allowedTypes)) {
            parameters.push({
                name: parameterPrefix + this.name, nameLowerCase: this.name.toLowerCase(),
                id: this.id, description: '', dataSourceName: dataSourceName
            });
        }
    }

    /**
     * Return true if parameter fulfills requirement of allowed types.
     * If parameter is an array it is only allowed if array type is contained in allowedTypes,
     * otherwise it is also allowed if allowedTypes is undefined/null.
     * @param {?String[]} allowedTypes - can be undefined/null or an array containing allowed parameter types.
     * @return {Boolean}
     */
    isAllowed(allowedTypes) {
        if (this.type !== Parameter.type.array) {
            return !Array.isArray(allowedTypes) || allowedTypes.indexOf(this.type) !== -1;
        } else {
            return Array.isArray(allowedTypes) && allowedTypes.indexOf(this.type) !== -1;
        }
    }

    /**
     * Appends field parameters of array parameter.
     *
     * Used in parameter popup window for parameter expression.
     *
     * @param {Object[]} parameters - list where parameter items will be appended to.
     * @param {String[]} allowedTypes - specify allowed parameter types which will be
     * added to the parameter list. If not set all parameter types are allowed.
     * @param {Boolean} relative - if true then added parameters are relative
     * to this one. This means that only the parameter name itself will
     * be set for the added parameters and parent parameters will also be searched.
     * If false then the full name including name of parent parameter will be set.
     * This is used when a parameter is selected for a function, e.g. sum or average
     * of a list field.
     * @param {?String} dataSourceName - data source name which will be set as prefix for inserted parameter name.
     */
    appendFieldParameterItems(parameters, allowedTypes, relative, dataSourceName) {
        if (this.type === Parameter.type.array) {
            let firstRowParam = true;
            for (let child of this.panelItem.getChildren()) {
                let parameter = child.getData();
                if (!Array.isArray(allowedTypes) ||
                        allowedTypes.indexOf(parameter.getValue('type')) !== -1) {
                    if (relative) {
                        if (firstRowParam) {
                            parameters.push({
                                separator: true, id: this.id,
                                separatorClass: 'rbroParameterRowGroup',
                                name: this.rb.getLabel('parameterRowParams')
                            });
                        }
                        let paramName = parameter.getName();
                        parameters.push({
                            name: paramName, nameLowerCase: paramName.toLowerCase(),
                            id: parameter.getId(), description: '', dataSourceName: dataSourceName
                        });
                    } else {
                        let paramName = this.name + '.' + parameter.getName();
                        parameters.push({
                            name: paramName, nameLowerCase: paramName.toLowerCase(),
                            id: parameter.getId(), description: '', dataSourceName: dataSourceName
                        });
                    }
                    firstRowParam = false;
                }
            }
        }
        if (relative) {
            let parent = this.getParent();
            while (parent !== null) {
                if (parent.type === Parameter.type.array) {
                    parent.appendFieldParameterItems(parameters, allowedTypes, relative, parent.name);
                    break;
                }
                parent = parent.getParent();
            }
        }
    }

    getParameterFields() {
        const fields = [];
        if (this.type === Parameter.type.array || this.type === Parameter.type.simpleArray ||
                this.type === Parameter.type.map) {
            if (this.type === Parameter.type.simpleArray) {
                fields.push({ name: 'data', type: this.arrayItemType, parameter: this });
            } else {
                for (let child of this.getChildren()) {
                    if (!child.showOnlyNameType && !child.eval && !child.isRangeFunction()) {
                        fields.push({ name: child.getName(), type: child.getValue('type'), parameter: child });
                    }
                }
            }
        }
        return fields;
    }

    /**
     * Returns test data of parameter as array or map.
     * The test data is sanitized, i.e. the data value types match the corresponding parameter types.
     * @param {Boolean} editFormat - if true the data will be returned in edit format (containing additional info),
     * i.e. the data is used in the popup window to edit test data.
     * @returns {?Object|Object[]} test data. Null in case parameter is not an array, simple array or map.
     */
    getTestData(editFormat) {
        let testData = null;
        try {
            testData = JSON.parse(this.testData);
        } catch (e) {
        }
        if (this.type === Parameter.type.array || this.type === Parameter.type.simpleArray ||
                this.type === Parameter.type.map) {
            if (testData) {
                return Parameter.getSanitizedTestData(this, testData, editFormat);
            }
        }
        return null;
    }

    /**
     * Returns test data of parameter as array or map.
     * The test data is sanitized, i.e. the data value types match the corresponding parameter types.
     * @returns {Object|Object[]} sanitized test data
     */
    static getSanitizedTestData(parameter, testData, editFormat) {
        let rv;
        if (parameter.type === Parameter.type.map) {
            if (!testData || Object.getPrototypeOf(testData) !== Object.prototype) {
                testData = {};
            }
            rv = Parameter.getSanitizedTestDataMap(parameter, testData, editFormat);
        } else if (parameter.type === Parameter.type.simpleArray) {
            rv = Parameter.getSanitizedTestDataSimpleArray(parameter, testData, editFormat);
        } else if (parameter.type === Parameter.type.array) {
            if (!Array.isArray(testData)) {
                testData = [];
            }
            rv = [];
            for (let testDataRow of testData) {
                if (!testDataRow || Object.getPrototypeOf(testDataRow) !== Object.prototype) {
                    testDataRow = {};
                }
                rv.push(Parameter.getSanitizedTestDataMap(parameter, testDataRow, editFormat));
            }
        }
        return rv;
    }

    static getSanitizedTestDataMap(parameter, testData, editFormat) {
        const rv = {};
        for (const field of parameter.getChildren()) {
            if (field.showOnlyNameType) {
                continue;
            }
            const value = (field.name in testData) ? testData[field.name] : null;
            if (field.type === Parameter.type.array || field.type === Parameter.type.map) {
                rv[field.name] = Parameter.getSanitizedTestData(field, value, editFormat);
            } else if (field.type === Parameter.type.simpleArray) {
                rv[field.name] = Parameter.getSanitizedTestDataSimpleArray(field, value, editFormat);
            } else {
                rv[field.name] = Parameter.getSanitizedTestDataValue(field.type, value, editFormat);
            }
        }
        return rv;
    }

    static getSanitizedTestDataSimpleArray(parameter, testData, editFormat) {
        let testDataRows = testData;
        if (!Array.isArray(testDataRows)) {
            testDataRows = [];
        }
        const arrayValues = [];
        for (let testDataRow of testDataRows) {
            if (Object.getPrototypeOf(testDataRow) === Object.prototype) {
                const val = Parameter.getSanitizedTestDataValue(
                    parameter.arrayItemType, testDataRow['data'], editFormat);
                if (editFormat) {
                    arrayValues.push({ data: val });
                } else {
                    arrayValues.push(val);
                }
            }
        }
        return arrayValues;
    }

    static getSanitizedTestDataValue(fieldType, testData, editFormat) {
        let rv = null;
        if (fieldType === Parameter.type.string) {
            if (typeof testData === 'string') {
                rv = testData;
            }
        } else if (fieldType === Parameter.type.number) {
            if (typeof testData === 'number') {
                rv = testData;
            } else if (typeof testData === 'string') {
                const num = Number(testData.replaceAll(',', '.'));
                if (!isNaN(num)) {
                    rv = num;
                }
            }
        } else if (fieldType === Parameter.type.boolean) {
            if (typeof testData === 'boolean') {
                rv = testData;
            } else {
                rv = Boolean(testData);
            }
        } else if (fieldType === Parameter.type.date) {
            if (typeof testData === 'string') {
                // we allow dates in format "YYYY-MM-DD", "YYYY-MM-DD HH:MM" and "YYYY-MM-DD HH:MM:SS" for test data
                if (Parameter.dateRegex.test(testData)) {
                    rv = testData;
                }
            }
        } else if (fieldType === Parameter.type.image) {
            if (!testData || Object.getPrototypeOf(testData) !== Object.prototype ||
                    !('data' in testData) || !('filename' in testData)) {
                if (editFormat) {
                    rv = { data: '', filename: '' };
                } else {
                    rv = '';
                }
            } else {
                if (editFormat) {
                    rv = testData;
                } else {
                    rv = testData.data;
                }
            }
        } else if (fieldType === Parameter.type.richText) {
            if (typeof testData === 'string') {
                rv = testData;
            }
        }
        return rv;
    }

    /**
     * Removes ids of possible child elements.
     * @param {Object} data - map containing parameter data.
     */
    static removeIds(data) {
        if (data.children) {
            for (let child of data.children) {
                if ('id' in child) {
                    delete child.id;
                }
            }
        }
    }

    /**
     * Returns class name.
     * This can be useful for introspection when the class names are mangled
     * due to the webpack uglification process.
     * @returns {string}
     */
    getClassName() {
        return 'Parameter';
    }
}

Parameter.type = {
    'none': 'none',
    'string': 'string',
    'number': 'number',
    'boolean': 'boolean',
    'date': 'date',
    'image': 'image',
    'richText': 'rich_text',
    'array': 'array',
    'simpleArray': 'simple_array',
    'map': 'map',
    'sum': 'sum',
    'average': 'average'
};
