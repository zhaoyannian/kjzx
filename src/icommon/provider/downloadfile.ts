/*
 * @Descripttion: 
 * @version: 
 * @Author: ZhaoYanNian
 * @Date: 2019-07-24 15:21:50
 * @LastEditors: ZhaoYanNian
 * @LastEditTime: 2019-12-19 09:51:55
 */

/**
 * Created by shenqingqing on 2019-3-29.
 */
import { NativeService } from './native';
import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';

/**
 * @description
 */
@Injectable()
export class DownloadFileService {
  loginObj: any;
  constructor(private http: HttpClient, private nativeService: NativeService, private events: Events) {

  }

}
