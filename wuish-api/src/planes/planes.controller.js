"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanesController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
var admin_guard_1 = require("../auth/admin.guard");
var PlanesController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('Planes'), (0, common_1.Controller)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _findAllTipos_decorators;
    var _createTipo_decorators;
    var _updateTipo_decorators;
    var _deleteTipo_decorators;
    var _findAll_decorators;
    var _findOne_decorators;
    var _create_decorators;
    var _update_decorators;
    var _remove_decorators;
    var PlanesController = _classThis = /** @class */ (function () {
        function PlanesController_1(planesService) {
            this.planesService = (__runInitializers(this, _instanceExtraInitializers), planesService);
        }
        // ========== TIPOS DE SERVICIO ==========
        PlanesController_1.prototype.findAllTipos = function () {
            return this.planesService.findAllTiposServicio();
        };
        PlanesController_1.prototype.createTipo = function (data) {
            return this.planesService.createTipoServicio(data);
        };
        PlanesController_1.prototype.updateTipo = function (id, data) {
            return this.planesService.updateTipoServicio(id, data);
        };
        PlanesController_1.prototype.deleteTipo = function (id) {
            return this.planesService.deleteTipoServicio(id);
        };
        // ========== PLANES ==========
        PlanesController_1.prototype.findAll = function (all) {
            return this.planesService.findAllPlanes(all !== 'true');
        };
        PlanesController_1.prototype.findOne = function (id) {
            return this.planesService.findOnePlan(id);
        };
        PlanesController_1.prototype.create = function (data) {
            return this.planesService.createPlan(data);
        };
        PlanesController_1.prototype.update = function (id, data) {
            return this.planesService.updatePlan(id, data);
        };
        PlanesController_1.prototype.remove = function (id) {
            return this.planesService.deletePlan(id);
        };
        return PlanesController_1;
    }());
    __setFunctionName(_classThis, "PlanesController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _findAllTipos_decorators = [(0, common_1.Get)('tipos-servicio'), (0, swagger_1.ApiOperation)({ summary: 'Listar tipos de servicio con sus planes' })];
        _createTipo_decorators = [(0, common_1.Post)('tipos-servicio'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Crear tipo de servicio (admin)' })];
        _updateTipo_decorators = [(0, common_1.Put)('tipos-servicio/:id'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Actualizar tipo de servicio (admin)' })];
        _deleteTipo_decorators = [(0, common_1.Delete)('tipos-servicio/:id'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Eliminar tipo de servicio (admin)' })];
        _findAll_decorators = [(0, common_1.Get)('planes'), (0, swagger_1.ApiOperation)({ summary: 'Listar todos los planes (público: solo activos)' })];
        _findOne_decorators = [(0, common_1.Get)('planes/:id'), (0, swagger_1.ApiOperation)({ summary: 'Obtener plan por ID' })];
        _create_decorators = [(0, common_1.Post)('planes'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Crear plan (admin)' })];
        _update_decorators = [(0, common_1.Put)('planes/:id'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Actualizar plan (admin)' })];
        _remove_decorators = [(0, common_1.Delete)('planes/:id'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Desactivar plan (admin)' })];
        __esDecorate(_classThis, null, _findAllTipos_decorators, { kind: "method", name: "findAllTipos", static: false, private: false, access: { has: function (obj) { return "findAllTipos" in obj; }, get: function (obj) { return obj.findAllTipos; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createTipo_decorators, { kind: "method", name: "createTipo", static: false, private: false, access: { has: function (obj) { return "createTipo" in obj; }, get: function (obj) { return obj.createTipo; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateTipo_decorators, { kind: "method", name: "updateTipo", static: false, private: false, access: { has: function (obj) { return "updateTipo" in obj; }, get: function (obj) { return obj.updateTipo; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteTipo_decorators, { kind: "method", name: "deleteTipo", static: false, private: false, access: { has: function (obj) { return "deleteTipo" in obj; }, get: function (obj) { return obj.deleteTipo; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAll_decorators, { kind: "method", name: "findAll", static: false, private: false, access: { has: function (obj) { return "findAll" in obj; }, get: function (obj) { return obj.findAll; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findOne_decorators, { kind: "method", name: "findOne", static: false, private: false, access: { has: function (obj) { return "findOne" in obj; }, get: function (obj) { return obj.findOne; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _create_decorators, { kind: "method", name: "create", static: false, private: false, access: { has: function (obj) { return "create" in obj; }, get: function (obj) { return obj.create; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _update_decorators, { kind: "method", name: "update", static: false, private: false, access: { has: function (obj) { return "update" in obj; }, get: function (obj) { return obj.update; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _remove_decorators, { kind: "method", name: "remove", static: false, private: false, access: { has: function (obj) { return "remove" in obj; }, get: function (obj) { return obj.remove; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PlanesController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PlanesController = _classThis;
}();
exports.PlanesController = PlanesController;
