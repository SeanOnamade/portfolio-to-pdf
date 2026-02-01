import axios from 'axios';

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  location: string;
  company: string;
  blog: string;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
  contributions?: number;
  contributionCalendar?: {
    totalContributions: number;
    weeks: {
      contributionDays: {
        color: string;
        contributionCount: number;
        date: string;
        weekday: number;
      }[];
    }[];
  };
  readme?: string;
}

export interface PinnedRepo {
  owner: string;
  repo: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  forks: number;
}

export const fetchGitHubUser = async (username: string): Promise<GitHubUser> => {
  const [userRes, contribRes, readmeRes] = await Promise.all([
    axios.get(`https://api.github.com/users/${username}`),
    axios.get(`https://github-contributions-api.deno.dev/${username}.json`).catch(() => ({ data: null })),
    axios.get(`https://raw.githubusercontent.com/${username}/${username}/main/README.md`).catch(() =>
      axios.get(`https://raw.githubusercontent.com/${username}/${username}/master/README.md`)
    ).catch(() => ({ data: '' }))
  ]);

  const user = userRes.data;
  if (contribRes.data) {
    const contribData = contribRes.data;
    
    // Try to extract total contributions
    user.contributions = contribData.totalContributions || 
                         contribData.total?.lastYear || 
                         contribData.total;
    
    const levelColors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
    
    // Handle nested array format: contributions is an array of weeks, each week is an array of days
    if (Array.isArray(contribData.contributions) && contribData.contributions.length > 0) {
      const contributionsData = contribData.contributions;
      
      // Check if it's a nested array (array of weeks) or flat array (array of days)
      if (Array.isArray(contributionsData[0])) {
        // Nested array: each item is a week containing days
        
        const weeks = contributionsData.map((weekData: any[], weekIndex: number) => {
          const contributionDays = weekData.map((day: any, dayIndex: number) => ({
            color: day.color || levelColors[day.level || 0] || '#ebedf0',
            contributionCount: day.contributionCount || day.count || 0,
            date: day.date || '',
            weekday: dayIndex
          }));
          
          // Pad to 7 days if needed
          while (contributionDays.length < 7) {
            contributionDays.push({
              color: 'transparent',
              contributionCount: 0,
              date: '',
              weekday: contributionDays.length
            });
          }
          
          return { contributionDays };
        });
        
        
        user.contributionCalendar = {
          totalContributions: user.contributions || contribData.totalContributions || 0,
          weeks
        };
      } else {
        // Flat array of days - need to group into weeks
        
        const dayMap = new Map<string, any>();
        contributionsData.forEach((day: any) => {
          dayMap.set(day.date, day);
        });
        
        const dates = contributionsData
          .map((d: any) => new Date(d.date))
          .filter((d: Date) => !isNaN(d.getTime()))
          .sort((a: Date, b: Date) => a.getTime() - b.getTime());
        
        if (dates.length > 0) {
          const weeks: { contributionDays: { color: string; contributionCount: number; date: string; weekday: number }[] }[] = [];
          const currentDate = new Date(dates[0]);
          currentDate.setDate(currentDate.getDate() - currentDate.getDay());
          
          while (currentDate <= dates[dates.length - 1]) {
            const week: { color: string; contributionCount: number; date: string; weekday: number }[] = [];
            
            for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
              const dateStr = currentDate.toISOString().split('T')[0];
              const dayData = dayMap.get(dateStr);
              
              week.push({
                color: dayData ? (dayData.color || levelColors[dayData.level || 0]) : 'transparent',
                contributionCount: dayData ? (dayData.count || dayData.contributionCount || 0) : 0,
                date: dateStr,
                weekday: dayOfWeek
              });
              
              currentDate.setDate(currentDate.getDate() + 1);
            }
            
            weeks.push({ contributionDays: week });
          }
          
          user.contributionCalendar = {
            totalContributions: user.contributions || 0,
            weeks
          };
        }
      }
    } else if (contribData.weeks) {
      user.contributionCalendar = contribData;
    } else {
    }
  }
  user.readme = readmeRes.data;

  return user;
};

export const fetchPinnedRepos = async (username: string): Promise<PinnedRepo[]> => {
  let pinned: PinnedRepo[] = [];
  try {
    const response = await axios.get(`https://gh-pinned-repos.egoist.dev/?username=${username}`);
    pinned = response.data;
  } catch (error) {
    console.warn('Failed to fetch pinned repos via proxy:', error);
  }

  // If proxy returned empty or failed, fallback to top repos
  if (!pinned || pinned.length === 0) {
    const response = await axios.get(`https://api.github.com/users/${username}/repos?sort=stars&per_page=6`);
    return response.data.map((repo: any) => ({
      owner: repo.owner.login,
      repo: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
    }));
  }

  return pinned;
};
