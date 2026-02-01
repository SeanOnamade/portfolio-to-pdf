import React from 'react';
import { Star, GitFork, MapPin, Link as LinkIcon, Building } from 'lucide-react';
import type { GitHubUser, PinnedRepo } from '../utils/github';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ContributionHeatmap from './ContributionHeatmap';

interface PortfolioContentProps {
    user: GitHubUser;
    pinnedRepos: PinnedRepo[];
}

const PortfolioContent: React.FC<PortfolioContentProps> = ({ user, pinnedRepos }) => {
    return (
        <div id="portfolio-render" className="portfolio-container">
            <div className="portfolio-header">
                <img src={user.avatar_url} alt={user.name} className="avatar" />
                <div className="profile-info">
                    <h1>{user.name || user.login}</h1>
                    {user.bio && <p>{user.bio}</p>}
                    <div className="repo-meta" style={{ marginTop: '12px', fontSize: '0.875rem' }}>
                        {user.location && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={14} /> {user.location}
                            </span>
                        )}
                        {user.company && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Building size={14} /> {user.company}
                            </span>
                        )}
                        {user.blog && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <LinkIcon size={14} /> {user.blog.replace(/^https?:\/\//, '')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="metrics-grid">
                <div className="metric-card">
                    <span className="metric-value">{user.contributions || 'N/A'}</span>
                    <span className="metric-label">Contributions</span>
                </div>
                <div className="metric-card">
                    <span className="metric-value">{user.public_repos}</span>
                    <span className="metric-label">Repositories</span>
                </div>
                <div className="metric-card">
                    <span className="metric-value">{user.followers}</span>
                    <span className="metric-label">Followers</span>
                </div>
                <div className="metric-card">
                    <span className="metric-value">{user.following}</span>
                    <span className="metric-label">Following</span>
                </div>
            </div>

            {user.contributionCalendar && user.contributionCalendar.weeks && (
                <ContributionHeatmap
                    weeks={user.contributionCalendar.weeks}
                    totalContributions={user.contributionCalendar.totalContributions}
                />
            )}

            {user.readme && (
                <div className="readme-section">
                    <h2>About</h2>
                    <div className="readme-content" style={{ fontSize: '0.9rem', color: '#475569' }}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                img: ({ node, src, alt, ...props }) => {
                                    // Filter out GitHub stats cards, badges, and other problematic external images
                                    const blockedDomains = [
                                        'github-readme-stats',
                                        'github-readme-streak-stats', 
                                        'github-profile-trophy',
                                        'github-readme-activity-graph',
                                        'github-contributor-stats',
                                        'github-profile-summary-cards',
                                        'komarev.com',
                                        'shields.io',
                                        'img.shields.io',
                                        'badge',
                                        'visitor',
                                        'hits.dwyl.com',
                                        'hits.seeyoufarm.com',
                                        'count.getloli.com',
                                        'profile-counter',
                                        'capsule-render',
                                        'readme-typing-svg',
                                        'skillicons.dev',
                                        'techstack-generator',
                                        'streak-stats',
                                        'activity-graph',
                                        'wakatime',
                                        'spotify-github-profile',
                                        'spotify-recently-played',
                                        'reactnative.dev',
                                        'vercel.app/api'
                                    ];
                                    const srcLower = (src || '').toLowerCase();
                                    const altLower = (alt || '').toLowerCase();
                                    
                                    // Skip stats cards, badges, and dynamic images
                                    if (blockedDomains.some(domain => srcLower.includes(domain)) ||
                                        altLower.includes('stats') ||
                                        altLower.includes('streak') ||
                                        altLower.includes('trophy') ||
                                        altLower.includes('langs') ||
                                        altLower.includes('visitor') ||
                                        altLower.includes('views') ||
                                        altLower.includes('wakatime')) {
                                        return null;
                                    }
                                    
                                    return (
                                        <img
                                            {...props}
                                            src={src}
                                            alt={alt}
                                            crossOrigin="anonymous"
                                            style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', margin: '16px 0' }}
                                            onError={(e) => {
                                                // Hide broken images
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    );
                                }
                            }}
                        >
                            {user.readme}
                        </ReactMarkdown>
                    </div>
                </div>
            )}

            <div className="repos-section">
                <h2>Highlighted Projects</h2>
                <div className="repos-grid">
                    {pinnedRepos.map((repo, index) => (
                        <a 
                            key={index} 
                            href={`https://github.com/${repo.owner}/${repo.repo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="repo-card"
                        >
                            <h3>{repo.repo}</h3>
                            <p className="repo-desc">{repo.description || 'No description available for this project.'}</p>
                            <div className="repo-meta">
                                {repo.language && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }}></div>
                                        {repo.language}
                                    </span>
                                )}
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Star size={12} /> {repo.stars}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <GitFork size={12} /> {repo.forks}
                                </span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            <div className="portfolio-footer">
                Portfolio generated from {user.html_url}
            </div>
        </div>
    );
};

export default PortfolioContent;
