export interface Modifier {
    name: string;
    description: string;
    scoreMultiplier?: number; 
    invalidComboModifiers?: string[];
}

export const WW_MODIFIERS: Modifier[] = [
    {
        name: 'Nightmare',
        description: 'Doubles the game speed and shrinks the board size. Good luck with this mode.',
    },
    {
        name: 'Invasion',
        description: 'Spaceships spawn in swarms. Multi-Shot more common.',
    },
    {
        name: 'Matrix',
        description: 'Spaceships armed with MultiShot',
    },
];

export const TPK_MODIFIERS: Modifier[] = [
    {
        name: 'Nightmare',
        description: 'Doubles the game speed and shrinks the board size. Good luck with this mode.',
        scoreMultiplier: 2,
        invalidComboModifiers: [ 'Incline' ]
    },
    {
        name: 'Incline',
        description: 'Slowly speeds up the game every level.',
        scoreMultiplier: 0.5,
        invalidComboModifiers: [ 'Nightmare' ]
    },
    {
        name: 'Invasion',
        description: 'Spaceships spawn in swarms. Multi-Shot more common.',
        scoreMultiplier: 0.5
    },
    {
        name: 'Matrix',
        description: 'Spaceships armed with MultiShot',
        scoreMultiplier: 0.5
    },
    {
        name: 'Barebones',
        description: 'Powerup spawn chances reduced.',
        scoreMultiplier: 0.3
    },
    {
        name: 'Survivor',
        description: 'Start with one life.',
        scoreMultiplier: 1
    }
];