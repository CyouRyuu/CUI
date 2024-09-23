import command from '../../config.json' assert {type: 'json'};

const createAbout = () : string[] => {
  const about : string[] = [];

  const SPACE = "&nbsp;";
  
  const email = `<a href='mailto:${command.social.email}' class='fa fa-envelope' style='font-size:24px'></a>`;
  const cv = `<a href='https://cyouryuu.github.io/${command.social.cv}' class='ai ai-cv' style='font-size:24px'></a>`;
  const orcid = `<a href='https://orcid.org/${command.social.orcid}' class='ai ai-orcid' style='font-size:24px'></a>`;
  const dblp = `<a href='https://dblp.org/pid/${command.social.dblp}' class='ai ai-dblp ai-2x'></a>`;
  const googleScholar = `<a href='https://scholar.google.com/citations?user=${command.social.googleScholar}' class='ai ai-google-scholar ai-2x'></a>`;
  let string = "";
  const keywords = ["Aolong Zha", "Search", "Constraint Satisfaction", "Combinatorial Optimization", "GPGPU"];

  about.push("<br>");
  command.aboutGreeting.forEach((ele) => {
    let changedStr = ele;
    keywords.forEach((k) => {
      if (changedStr.indexOf(k) != -1) {
        changedStr = changedStr.replace(k, `<font color=white>${k}</font>`);
      }
    });
    about.push(changedStr);
  });
  about.push("<br>");
  string += "<span class='command'>'email'</span> " + email;
  string += SPACE.repeat(2);
  string += "<span class='command'>'cv'</span> " + cv;
  string += SPACE.repeat(2);
  string += "<span class='command'>'orcid'</span> " + orcid;
  string += SPACE.repeat(2);
  string += "<span class='command'>'dblp'</span> " + dblp;
  string += SPACE.repeat(2);
  string += "<span class='command'>'gs'</span> " + googleScholar;
  about.push(string);
  about.push("<br>");
  
  return about;
}

export const ABOUT = createAbout();
