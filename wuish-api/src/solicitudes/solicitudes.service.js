"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolicitudesService = void 0;
var common_1 = require("@nestjs/common");
var SolicitudesService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var SolicitudesService = _classThis = /** @class */ (function () {
        function SolicitudesService_1(prisma) {
            this.prisma = prisma;
        }
        SolicitudesService_1.prototype.findByUsuario = function (usuarioId) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.solicitud.findMany({
                            where: { usuario_id: usuarioId },
                            include: {
                                plan: { include: { tipo_servicio: true } },
                                admin_asignado: { select: { id: true, nombres: true, apellidos: true } },
                                historial: { orderBy: { changed_at: 'desc' } },
                            },
                            orderBy: { created_at: 'desc' },
                        })];
                });
            });
        };
        SolicitudesService_1.prototype.findAll = function (filters) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.solicitud.findMany({
                            where: __assign(__assign({}, ((filters === null || filters === void 0 ? void 0 : filters.estado) ? { estado: filters.estado } : {})), ((filters === null || filters === void 0 ? void 0 : filters.tipo) ? { tipo: filters.tipo } : {})),
                            include: {
                                usuario: { select: { id: true, nombres: true, apellidos: true, correo: true, telefono: true } },
                                plan: { include: { tipo_servicio: true } },
                                admin_asignado: { select: { id: true, nombres: true, apellidos: true } },
                            },
                            orderBy: { created_at: 'desc' },
                        })];
                });
            });
        };
        SolicitudesService_1.prototype.findOne = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                var solicitud;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.solicitud.findUnique({
                                where: { id: id },
                                include: {
                                    usuario: { select: { id: true, nombres: true, apellidos: true, correo: true, telefono: true, numero_cedula: true } },
                                    plan: { include: { tipo_servicio: true } },
                                    admin_asignado: { select: { id: true, nombres: true, apellidos: true } },
                                    ajustes: {
                                        include: { respondidoPor: { select: { id: true, nombres: true, apellidos: true } } },
                                        orderBy: { created_at: 'desc' },
                                    },
                                    historial: { orderBy: { changed_at: 'desc' } },
                                    mensajes: { orderBy: { created_at: 'desc' } },
                                },
                            })];
                        case 1:
                            solicitud = _a.sent();
                            if (!solicitud)
                                throw new common_1.NotFoundException('Solicitud no encontrada');
                            return [2 /*return*/, solicitud];
                    }
                });
            });
        };
        SolicitudesService_1.prototype.create = function (data) {
            return __awaiter(this, void 0, void 0, function () {
                var solicitud;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.solicitud.create({
                                data: {
                                    usuario_id: data.usuario_id,
                                    tipo: data.tipo,
                                    estado: 'pendiente',
                                    descripcion: data.descripcion,
                                    plan_id: data.plan_id || null,
                                    fecha_solicitud: new Date(),
                                },
                                include: {
                                    plan: { include: { tipo_servicio: true } },
                                    usuario: { select: { id: true, nombres: true, apellidos: true, correo: true } },
                                },
                            })];
                        case 1:
                            solicitud = _a.sent();
                            // Create initial history entry
                            return [4 /*yield*/, this.prisma.solicitudHistorialEstado.create({
                                    data: {
                                        solicitud_id: solicitud.id,
                                        estado_anterior: null,
                                        estado_nuevo: 'pendiente',
                                        motivo: 'Solicitud creada',
                                    },
                                })];
                        case 2:
                            // Create initial history entry
                            _a.sent();
                            return [2 /*return*/, solicitud];
                    }
                });
            });
        };
        SolicitudesService_1.prototype.updateEstado = function (id, data) {
            return __awaiter(this, void 0, void 0, function () {
                var current, updated;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.solicitud.findUnique({ where: { id: id } })];
                        case 1:
                            current = _a.sent();
                            if (!current)
                                throw new common_1.NotFoundException('Solicitud no encontrada');
                            return [4 /*yield*/, this.prisma.solicitud.update({
                                    where: { id: id },
                                    data: {
                                        estado: data.estado,
                                        admin_asignado_id: data.admin_asignado_id || current.admin_asignado_id,
                                        updated_at: new Date(),
                                    },
                                    include: {
                                        usuario: { select: { id: true, nombres: true, apellidos: true, correo: true } },
                                        plan: true,
                                    },
                                })];
                        case 2:
                            updated = _a.sent();
                            // Log state change
                            return [4 /*yield*/, this.prisma.solicitudHistorialEstado.create({
                                    data: {
                                        solicitud_id: id,
                                        estado_anterior: current.estado,
                                        estado_nuevo: data.estado,
                                        motivo: data.motivo || null,
                                    },
                                })];
                        case 3:
                            // Log state change
                            _a.sent();
                            return [2 /*return*/, updated];
                    }
                });
            });
        };
        SolicitudesService_1.prototype.addAjuste = function (solicitudId, data) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.prisma.solicitudAjuste.create({
                            data: {
                                solicitud_id: solicitudId,
                                descripcion_ajuste: data.descripcion_ajuste,
                                respondido_por: data.respondido_por,
                            },
                            include: {
                                respondidoPor: { select: { id: true, nombres: true, apellidos: true } },
                            },
                        })];
                });
            });
        };
        SolicitudesService_1.prototype.delete = function (id) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.prisma.solicitudHistorialEstado.deleteMany({ where: { solicitud_id: id } })];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.prisma.solicitudAjuste.deleteMany({ where: { solicitud_id: id } })];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, this.prisma.mensaje.deleteMany({ where: { solicitud_id: id } })];
                        case 3:
                            _a.sent();
                            return [2 /*return*/, this.prisma.solicitud.delete({ where: { id: id } })];
                    }
                });
            });
        };
        return SolicitudesService_1;
    }());
    __setFunctionName(_classThis, "SolicitudesService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SolicitudesService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SolicitudesService = _classThis;
}();
exports.SolicitudesService = SolicitudesService;
