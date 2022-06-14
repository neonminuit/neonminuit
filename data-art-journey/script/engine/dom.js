
export let dom = 
{
    canvas:         document.getElementById("shader"),
    container:      document.getElementById("container"),
    containerEnd:   document.getElementById("container-end"),
    events:         document.getElementById("events"),
    content:        document.getElementById("content"),
    colorPicker:    document.getElementById("color-picker"),
    inputText:      document.getElementById("input-text"),
    buttonOK:       document.getElementById("button-ok"),
    buttonBack:     document.getElementById("button-back"),
    buttonData:     document.getElementById("button-data"),
    buttonGif:      document.getElementById("button-gif"),
    info:           document.getElementById("info"),
    tips:           document.getElementById("tips"),
    data:           document.getElementById("data"),
    fade:           document.getElementById("fade"),

    show: function(d)
    {
        d.style.opacity = '100%';
        d.style.cursor = 'pointer';
    },
    
    hide: function(d)
    {
        d.style.opacity = '0%';
        d.style.cursor = 'default';
    },

    isVisible: function(d)
    {
        return d.style.opacity == 1;
    },
}