import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewsListPage } from './newsList';
import { NewsImgPage } from './newsImg';
import { NewsTextPage } from './newsText';
import { NewsVideoPage } from './newsVideo';
import { NewsDetailPage } from './newsDetail';
import {VgCoreModule} from 'videogular2/core';
import {VgControlsModule} from 'videogular2/controls';
import {VgOverlayPlayModule} from 'videogular2/overlay-play';
import {VgBufferingModule} from 'videogular2/buffering';
@NgModule({
  declarations: [
    NewsListPage,
    NewsImgPage,
    NewsTextPage,
    NewsVideoPage,
    NewsDetailPage
  ],
  imports: [
    //视频
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    IonicPageModule.forChild([
        NewsListPage,
        NewsImgPage,
        NewsTextPage,
        NewsVideoPage,
        NewsDetailPage,
        
    ]),
  ],
})
export class NewsModule {}
