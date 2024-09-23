import command from '../../config.json' assert {type: 'json'};

const createBanner = () : string[] => {
  const banner : string[] = [];
  banner.push("<br>");
  command.ascii.forEach((ele) => {
    let bannerString = "";
    //this is for the ascii art
    for (let i = 0; i < ele.length; i++) {
      if (i < 30) {
        let green = parseInt(String(255*i/30)).toString(16);
        if (parseInt(green, 16) < 10) {
          bannerString += `<font color=\"#FF0${green}00\">`;
        } else {
          bannerString += `<font color=\"#FF${green}00\">`;
        }
      }
      if (i == 30) {
        bannerString += "</font><span class='command'>";
      }
      if (i == 33) {
        bannerString += "</span><span class='hp'>";
      }
      if (ele[i] === " ") {
        bannerString += "&nbsp;";
      } else {
        bannerString += ele[i];
      }
    }
    
    let eleToPush = `<pre>${bannerString}</span></pre>`;
    banner.push(eleToPush);
  });  
  banner.push("<br>");
  banner.push("Type <span class='command'>'help'</span> for a list of some available commands.");
  banner.push(`Type <span class='command'>'repo'</span> to view the GitHub repository or click <a href='${command.repoLink}' class='fa fa-github icon-large'></a>.`);
  banner.push("<br>");
  return banner;
}

export const BANNER = createBanner();
