import {
  Injectable,
  inject
} from '@angular/core';

import {
  Functions,
  httpsCallable
} from '@angular/fire/functions';

@Injectable({
  providedIn: 'root'
})
export class AiService {

  private functions =
    inject(Functions);

  /* GENERATE INSIGHT */

  generatePlayerInsight(
    player: any,
    comments: string[]
  ) {

    const callable =

      httpsCallable(
        this.functions,
        'generatePlayerInsight'
      );

    return callable({

      player,

      comments

    });

  }

}