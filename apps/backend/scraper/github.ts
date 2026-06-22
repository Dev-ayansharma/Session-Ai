
import{ HttpsProxyAgent} from 'https-proxy-agent';
import axios from 'axios';

const agent = new HttpsProxyAgent(process.env.PROXY_URL!);
export async function ScrapeGitHubProfile(githubusername: string) {
    const userrepos = await axios.request({
        url: `https://api.github.com/users/${githubusername}/repos`,
        httpsAgent: agent,
    });
    return userrepos.data.map((repo: any) => ({
        name: repo.name,
        description: repo.description,
        fullName: repo.full_name,
     
    }));
}