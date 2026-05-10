import {
    Pipe,
    PipeTransform
} from '@angular/core';

@Pipe({
    name: 'playerFilter'
})

export class PlayerFilterPipe
    implements PipeTransform {

    transform(
        players: any[],
        search: string
    ): any[] {

        if (!players)
            return [];

        if (!search)
            return players;

        search =
            search.toLowerCase();

        return players.filter(
            player =>

                player.name
                    .toLowerCase()
                    .includes(search)
        );

    }

}