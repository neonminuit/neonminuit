
function User()
{
    let color = '...';
    let timeDate = '...';
    let name = '...';

    let colorCursor = [ 0.5, 0.5];

    this.getColor = () => { return color; }
    this.getTimeDate = () => { return timeDate; }
    this.getName = () => { return name; }
    this.getColorCursor = () => { return colorCursor; }

    this.setColor = (v) => { color = v; }
    this.setTimeDate = (v) => { timeDate = v; }
    this.setName = (v) => { name = v; }
    this.setColorCursor = (v) => { colorCursor = v; }

    this.getHTML = () => {
        return '<span class="info-data">'
        + 'DATA 1 : ' + color + '<br/>'
        + 'DATA 2 : ' + timeDate + '<br/>'
        + 'DATA 3 : ' + name
        + '</span>';
    }
}

export let user = new User();