class RainbowPattern extends Pattern
{
    // rainbow colorwheel
    constructor()
    {
        super( "rainbow" );
        this.channels =
        [
            "speed",
            "density",
            "contrast",
            "brightness",
            "hue"
        ];
    }
}
