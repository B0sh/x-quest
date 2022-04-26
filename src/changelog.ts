export class Changelog {
    static readonly versionHistory: string[][] = [
        [
            'v1.5 Walden\'s World Edition',
            'April 25th 2022',
            'Updated layout for Walden\'s World',
            'Offline play with local save data',
            'X-Quest Intro Cutscene',
        ],
        [
            'v1.4 <a href="https://tpkrpg.net/">TPK</a> Edition',
            'Feburary 22nd 2021',
            'All new X-Engine with rendering',
            'New spaceships, levels, powerups, and sound effects',
            'Game modifiers to increase difficulty',
            'Earn minigame points and set high scores with your TPK account',
        ],
        [
            '<a href="https://waldens.world/projects/x-quest/v1/x-quest.v1.3.php">v1.3</a>',
            'December 20th 2017',
            'New Powerup: Multi-shot',
            'Support for iPad & some older browsers',
            'Fun Option: Font changer',
            'Fix: Spaceship hidden behind level up text.'
        ],
        [
            'v1.2',
            'November 12th 2017',
            'Adjusted leveling mechanics',
            'Added an arcade-style kill screen',
        ],
        [
            'v1.1',
            'November 5th 2017',
            'Added Nightmare mode',
        ],
        [
            'v1.0',
            'November 1st 2017',
            'New colors; Black Page conversion.',
            'New breaks at Levels.',
            'New Road Tiles with smooth tiling.',
            'New Powerup: Warp',
            'Added Volume Slider.'
        ],
        [
            'v0.96',
            'October 20th 2017',
            'Added a favicon for style.',
            'Fixed sound effects'
        ],
        [
            '<a href="https://waldens.world/projects/x-quest/v1/x-quest.v0.95.php">v0.95</a>',
            'August 3rd 2016',
            'Added a high score list.'
        ],
        [
            'v0.9',
            'September 12th 2014',
            'Added a changelog.',
            'Layout changes.',
            'Pellets now give less score.',
            'Time played is now tracked.',
            'Added sound effects.'
        ],
        [
            'v0.81',
            'June 16th 2014',
            'Pausing during a game over will cause it to revive you.',
            'You couldn&#39;t shoot ship bullets.'
        ],
        [
            'v0.8',
            'June 13th 2014',
            'Ships fly on and off the screen instead of disappearing',
            'Added tabbed windows',
            'Statistics window tracks more statistics.',
            'New save file storage system.'
        ]
    ];

    static createChangelog() {
        let text = '';
        Changelog.versionHistory.forEach((changelog) => {
            text += `X-Quest ${changelog[0]}: ${changelog[1]}<br>`;
        
            for (let line = 2; line < changelog.length; line++) {
                text += `<span style="color: #AAA;"> &bull; ${changelog[line]}</span><br>`;
            }

            text += `<br>`;
        });
        return text;
    };
};