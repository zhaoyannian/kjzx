import { Component, ElementRef, ViewChild } from '@angular/core';
import { Events, IonicPage, NavController, NavParams } from 'ionic-angular';
import { NativeService } from '../../../icommon/provider/native';

declare let Cropper;

/**
 * 图片裁剪
 * @example
    this.navCtrl.push('CropImagePage', {imageSrc: this.originalSrc}).then(() => {
      this.events.subscribe('crop-image:result', imgBase64Str => {
        this.newSrc = imgBase64Str;
      });
    });
 */
@IonicPage()
@Component({
  selector: 'page-crop-image',
  templateUrl: 'crop-image.html',
})
export class CropImagePage {

  imageSrc: string; // 要裁剪的图片路径

  @ViewChild('image')
  image: ElementRef;

  cropper;
  visibility = 'hidden';

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public events: Events,
              public nativeService: NativeService) {
  }

  ionViewCanEnter() {
    let imageSrc = this.navParams.get('imageSrc');
    if (!imageSrc) {
      this.nativeService.showAlert('需要裁剪的图片路径不能为空');
      return false;
    }
    this.imageSrc = imageSrc;
  }

  ionViewDidEnter() {
    let option = {
      autoCropArea: 0.5, // 初始裁剪区占图片大小
      aspectRatio: 1, // 裁剪区宽高比例，如16/9
      minCropBoxWidth: 60, // 最小裁剪宽度
      minCropBoxHeight: 60, // 最小裁剪高度
      viewMode: 1, // 图片移动范围，0无限制，1图片必须包裁剪区
      dragMode: 'move', // move设置裁剪区只可移动
      toggleDragModeOnDblclick: false,
      cropBoxResizable: true
    };
    this.cropper = new Cropper(this.image.nativeElement, option);
    this.visibility = 'visible'
  }

  save() {
    let cas = this.cropper.getCroppedCanvas();
    // cas.toBlob(function (e) {  // 生成Blob的图片格式
    //   console.log(e);
    // });
    let imgBase64Str = cas.toDataURL('image/jpeg');  // 生成base64图片的格式;
    this.events.publish('crop-image:result', imgBase64Str);
    this.nativeService.showToast("操作成功").then(()=>{
      setTimeout(() => {
        this.navCtrl.pop()
      },800)
    })
  }

  ionViewWillLeave() {
    this.events.unsubscribe('crop-image:result'); // 退出页面取消所有订阅，进入页面前需订阅
  }
}
