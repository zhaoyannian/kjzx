/**
 * Created by shenqingqing on 2018-10-18.
 */
import { Injectable } from '@angular/core';
import { FileObj } from '../model/FileObj';
import { Observable } from 'rxjs/Rx';
import { NativeService } from './native';
import { HttpClient } from '@angular/common/http';
import { ENV } from '@env/environment';
/**
 * 上传图片到文件服务器
 */
@Injectable()
export class FileService {
  constructor(private  http: HttpClient,
        private nativeService: NativeService,) {
                 
  }
   /**
   * 根据base64(字符串)批量上传图片
   * @param fileObjList 数组中的对象必须包含bse64属性
   * @returns {FileObj[]}
   */
  uploadMultiByBase64(fileObjList: FileObj[]): Observable<FileObj[]> {
    if (!fileObjList || fileObjList.length === 0) {
      return Observable.of([]);
    }
    return Observable.create(observer => {
      this.http.post(ENV.httpurl + '/api/fileinfo/uploadFile', fileObjList).subscribe(result => {
        if (result['result']==true) {
          observer.next([result['newContent']]);
        } else {
          this.nativeService.showAlert(result['message']);
          observer.error();
        }
      },error =>{
      });
    });
  }

  /**
   * 根据base64(字符串)上传单张图片
   * @param fileObj 对象必须包含origPath属性
   * @returns {FileObj}
   */
  uploadByBase64(fileObj: FileObj): Observable<FileObj> {
    if (!fileObj.base64) {
      return Observable.of({});
    }
    return this.uploadMultiByBase64([fileObj]).map(res => {
      return res[0] || {};
    });
  }
    /**
   *  根据filePath(文件路径)批量上传图片
   * @param fileObjList 数组中的对象必须包含origPath属性
   * @returns {FileObj[]}
   */
  uploadMultiByFilePath(fileObjList: FileObj[]): Observable<FileObj[]> {
    if (fileObjList.length === 0) {
      return Observable.of([]);
    }
    return Observable.create((observer) => {
        this.nativeService.showLoading();
        const fileObjs = [];
        for (const fileObj of fileObjList) {
            this.nativeService.convertImgToBase64(fileObj.origPath).subscribe(base64 => {
            fileObjs.push({
                'base64': base64,
                'type': FileService.getFileType(fileObj.origPath),
                'parameter': fileObj.parameter
            });
            if (fileObjs.length === fileObjList.length) {
                this.uploadMultiByBase64(fileObjs).subscribe(res => {
                observer.next(res);
                this.nativeService.hideLoading();
                });
            }
            });
        }
    });
  }
    /**
   * 根据filePath(文件路径)上传单张图片
   * @param fileObj 对象必须包含origPath属性
   * @returns {FileObj}
   */
  uploadByFilePath(fileObj: FileObj): Observable<FileObj> {
    if (!fileObj.origPath) {
      return Observable.of({});
    }
    return this.uploadMultiByFilePath([fileObj]).map(res => {
      return res[0] || {};
    });
  }
   // 根据文件后缀获取文件类型
   private static getFileType(path: string): string {
    return path.substring(path.lastIndexOf('.') + 1);
  }
}