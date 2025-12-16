import { __decorate } from "tslib";
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [],
        controllers: [AppController],
        providers: [AppService],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map