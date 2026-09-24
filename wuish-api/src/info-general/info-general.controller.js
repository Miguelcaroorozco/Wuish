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
exports.InfoGeneralController = void 0;
var common_1 = require("@nestjs/common");
var swagger_1 = require("@nestjs/swagger");
var jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
var admin_guard_1 = require("../auth/admin.guard");
var InfoGeneralController = function () {
    var _classDecorators = [(0, swagger_1.ApiTags)('Info General'), (0, common_1.Controller)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _findAllInfo_decorators;
    var _findBySeccion_decorators;
    var _upsertInfo_decorators;
    var _findAllEquipo_decorators;
    var _createEquipo_decorators;
    var _updateEquipo_decorators;
    var _deleteEquipo_decorators;
    var _findAllResultados_decorators;
    var _createResultado_decorators;
    var _updateResultado_decorators;
    var _deleteResultado_decorators;
    var _findAllPasos_decorators;
    var _upsertPaso_decorators;
    var _deletePaso_decorators;
    var InfoGeneralController = _classThis = /** @class */ (function () {
        function InfoGeneralController_1(infoService) {
            this.infoService = (__runInitializers(this, _instanceExtraInitializers), infoService);
        }
        // ========== INFO GENERAL (Público) ==========
        InfoGeneralController_1.prototype.findAllInfo = function () {
            return this.infoService.findAllInfo();
        };
        InfoGeneralController_1.prototype.findBySeccion = function (seccion) {
            return this.infoService.findInfoBySeccion(seccion);
        };
        InfoGeneralController_1.prototype.upsertInfo = function (req, data) {
            return this.infoService.upsertInfo(data.seccion, data.contenido, req.user.sub);
        };
        // ========== EQUIPO (Público + Admin CRUD) ==========
        InfoGeneralController_1.prototype.findAllEquipo = function () {
            return this.infoService.findAllEquipo();
        };
        InfoGeneralController_1.prototype.createEquipo = function (data) {
            return this.infoService.createEquipo(data);
        };
        InfoGeneralController_1.prototype.updateEquipo = function (id, data) {
            return this.infoService.updateEquipo(id, data);
        };
        InfoGeneralController_1.prototype.deleteEquipo = function (id) {
            return this.infoService.deleteEquipo(id);
        };
        // ========== RESULTADOS (Público + Admin CRUD) ==========
        InfoGeneralController_1.prototype.findAllResultados = function (all) {
            return this.infoService.findAllResultados(all !== 'true');
        };
        InfoGeneralController_1.prototype.createResultado = function (data) {
            return this.infoService.createResultado(data);
        };
        InfoGeneralController_1.prototype.updateResultado = function (id, data) {
            return this.infoService.updateResultado(id, data);
        };
        InfoGeneralController_1.prototype.deleteResultado = function (id) {
            return this.infoService.deleteResultado(id);
        };
        // ========== PASOS DEL PROCESO (Público + Admin) ==========
        InfoGeneralController_1.prototype.findAllPasos = function () {
            return this.infoService.findAllPasos();
        };
        InfoGeneralController_1.prototype.upsertPaso = function (data) {
            return this.infoService.upsertPaso(data);
        };
        InfoGeneralController_1.prototype.deletePaso = function (id) {
            return this.infoService.deletePaso(id);
        };
        return InfoGeneralController_1;
    }());
    __setFunctionName(_classThis, "InfoGeneralController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _findAllInfo_decorators = [(0, common_1.Get)('info-general'), (0, swagger_1.ApiOperation)({ summary: 'Obtener toda la información general (público)' })];
        _findBySeccion_decorators = [(0, common_1.Get)('info-general/:seccion'), (0, swagger_1.ApiOperation)({ summary: 'Obtener info por sección' })];
        _upsertInfo_decorators = [(0, common_1.Put)('info-general'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Crear o actualizar sección de info (admin)' })];
        _findAllEquipo_decorators = [(0, common_1.Get)('equipo'), (0, swagger_1.ApiOperation)({ summary: 'Obtener miembros del equipo (público)' })];
        _createEquipo_decorators = [(0, common_1.Post)('equipo'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Agregar miembro al equipo (admin)' })];
        _updateEquipo_decorators = [(0, common_1.Put)('equipo/:id'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Actualizar miembro del equipo (admin)' })];
        _deleteEquipo_decorators = [(0, common_1.Delete)('equipo/:id'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Eliminar miembro del equipo (admin)' })];
        _findAllResultados_decorators = [(0, common_1.Get)('resultados'), (0, swagger_1.ApiOperation)({ summary: 'Obtener resultados/portfolio (público)' })];
        _createResultado_decorators = [(0, common_1.Post)('resultados'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Crear resultado (admin)' })];
        _updateResultado_decorators = [(0, common_1.Put)('resultados/:id'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Actualizar resultado (admin)' })];
        _deleteResultado_decorators = [(0, common_1.Delete)('resultados/:id'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Eliminar resultado (admin)' })];
        _findAllPasos_decorators = [(0, common_1.Get)('pasos-proceso'), (0, swagger_1.ApiOperation)({ summary: 'Obtener pasos del proceso (público)' })];
        _upsertPaso_decorators = [(0, common_1.Put)('pasos-proceso'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Crear o actualizar paso del proceso (admin)' })];
        _deletePaso_decorators = [(0, common_1.Delete)('pasos-proceso/:id'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, admin_guard_1.AdminGuard), (0, swagger_1.ApiBearerAuth)(), (0, swagger_1.ApiOperation)({ summary: 'Eliminar paso del proceso (admin)' })];
        __esDecorate(_classThis, null, _findAllInfo_decorators, { kind: "method", name: "findAllInfo", static: false, private: false, access: { has: function (obj) { return "findAllInfo" in obj; }, get: function (obj) { return obj.findAllInfo; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findBySeccion_decorators, { kind: "method", name: "findBySeccion", static: false, private: false, access: { has: function (obj) { return "findBySeccion" in obj; }, get: function (obj) { return obj.findBySeccion; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _upsertInfo_decorators, { kind: "method", name: "upsertInfo", static: false, private: false, access: { has: function (obj) { return "upsertInfo" in obj; }, get: function (obj) { return obj.upsertInfo; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAllEquipo_decorators, { kind: "method", name: "findAllEquipo", static: false, private: false, access: { has: function (obj) { return "findAllEquipo" in obj; }, get: function (obj) { return obj.findAllEquipo; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createEquipo_decorators, { kind: "method", name: "createEquipo", static: false, private: false, access: { has: function (obj) { return "createEquipo" in obj; }, get: function (obj) { return obj.createEquipo; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateEquipo_decorators, { kind: "method", name: "updateEquipo", static: false, private: false, access: { has: function (obj) { return "updateEquipo" in obj; }, get: function (obj) { return obj.updateEquipo; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteEquipo_decorators, { kind: "method", name: "deleteEquipo", static: false, private: false, access: { has: function (obj) { return "deleteEquipo" in obj; }, get: function (obj) { return obj.deleteEquipo; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAllResultados_decorators, { kind: "method", name: "findAllResultados", static: false, private: false, access: { has: function (obj) { return "findAllResultados" in obj; }, get: function (obj) { return obj.findAllResultados; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _createResultado_decorators, { kind: "method", name: "createResultado", static: false, private: false, access: { has: function (obj) { return "createResultado" in obj; }, get: function (obj) { return obj.createResultado; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _updateResultado_decorators, { kind: "method", name: "updateResultado", static: false, private: false, access: { has: function (obj) { return "updateResultado" in obj; }, get: function (obj) { return obj.updateResultado; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deleteResultado_decorators, { kind: "method", name: "deleteResultado", static: false, private: false, access: { has: function (obj) { return "deleteResultado" in obj; }, get: function (obj) { return obj.deleteResultado; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findAllPasos_decorators, { kind: "method", name: "findAllPasos", static: false, private: false, access: { has: function (obj) { return "findAllPasos" in obj; }, get: function (obj) { return obj.findAllPasos; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _upsertPaso_decorators, { kind: "method", name: "upsertPaso", static: false, private: false, access: { has: function (obj) { return "upsertPaso" in obj; }, get: function (obj) { return obj.upsertPaso; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _deletePaso_decorators, { kind: "method", name: "deletePaso", static: false, private: false, access: { has: function (obj) { return "deletePaso" in obj; }, get: function (obj) { return obj.deletePaso; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        InfoGeneralController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return InfoGeneralController = _classThis;
}();
exports.InfoGeneralController = InfoGeneralController;
