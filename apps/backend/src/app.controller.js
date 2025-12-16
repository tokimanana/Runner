import { __decorate } from "tslib";
import { Controller, Get } from '@nestjs/common';
let AppController = class AppController {
    constructor(appService) {
        this.appService = appService;
    }
    getHello() {
        return this.appService.getHello();
    }
};
__decorate([
    Get()
], AppController.prototype, "getHello", null);
AppController = __decorate([
    Controller()
], AppController);
export { AppController };
//# sourceMappingURL=app.controller.js.map