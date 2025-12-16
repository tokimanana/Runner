import { __decorate } from "tslib";
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
let AppComponent = class AppComponent {
    constructor() {
        this.title = 'frontend';
    }
};
AppComponent = __decorate([
    Component({
        selector: 'app-root',
        imports: [RouterOutlet],
        templateUrl: './app.component.html',
        styleUrl: './app.component.scss'
    })
], AppComponent);
export { AppComponent };
//# sourceMappingURL=app.component.js.map