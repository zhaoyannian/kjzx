import { NativeService } from './native';
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse, HttpErrorResponse } from "@angular/common/http";
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { mergeMap } from 'rxjs/operators';
import { NavController, App } from 'ionic-angular';
import { LoginPage } from '../../pages/login/login'
import {
  Observable,
} from 'rxjs'
import {
  timeout, delay, retryWhen, scan, tap,
  catchError
} from 'rxjs/operators'
/** 超时时间 */
const DEFAULTTIMEOUT = 800
/** 最大重试次数 */
const MAXRETRYCOUNT = 0
@Injectable()
export class InterceptorService implements HttpInterceptor {
  isLogin: any;
  constructor(
    private NativeService: NativeService, public appCtrl: App) {
    // this.isLogin = false;
  }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authReq = req.clone({
      headers: haha(req)
    });

    return next.handle(authReq).pipe(
      timeout(DEFAULTTIMEOUT),
      retryWhen(err$ => {
        //重试 节奏控制器
        return err$.pipe(
          scan((errCount, err) => {
            if (errCount >= MAXRETRYCOUNT) {
              throw err
            }
            return errCount + 1
          }, 0),
          delay(100),
          tap(errCount => {

          })
        )
      }),
      mergeMap((event: any) => {
        if (event instanceof HttpResponse && event.status != 200) {
          return ErrorObservable.create(event);
        }
        return Observable.create(observer => observer.next(event)); //请求成功返回响应
      }),
      catchError((res: HttpResponse<any>) => {   //请求失败处理
        switch (res.status) {
          case 500: {
            console.log('500000000000000000000000');
            this.NativeService.hideLoading();
            break;
          }
          case 601: {
            // console.log('000')
            this.NativeService.hideLoading();
            if (localStorage.getItem("token") == '1') {
              break;
            }
            localStorage.setItem('token', '1');
            // this.isLogin =true;
            let activeNav: NavController = this.appCtrl.getActiveNav();
            // console.log(activeNav)
            activeNav.push(LoginPage);
            // this.navCtrl.setRoot(LoginPage);
            break;
          }
          case 401: {
            this.NativeService.hideLoading();
            console.log('401 业务错误');
            break;
          }
          case 200:
            this.NativeService.hideLoading();
            console.log('200 业务错误');
            break;
          case 204:
            this.NativeService.hideLoading();
            console.log('204 业务错误');
            break;
          case 404:
            this.NativeService.hideLoading();
            console.log('404');
            break;
          case 403:
            this.NativeService.hideLoading();
            console.log('403业务错误');
            break;
        }
        return ErrorObservable.create(event);
      }));
  }
}

function haha(req) {
  let loginObj = localStorage.getItem("token");
  let fileObj = localStorage.getItem("file");
  if (loginObj == "" || loginObj == null) {
    return '';
  } else if (!!fileObj) {
    return req.headers.set('Content-Type', undefined) && req.headers.set('Authorization', "Bearer " + loginObj);
  } else {
    return req.headers.set('Authorization', "Bearer " + loginObj);
  }
}
