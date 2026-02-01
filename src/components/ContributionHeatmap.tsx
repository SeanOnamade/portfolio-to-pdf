import React from 'react';

interface ContributionDay {
    color: string;
    contributionCount: number;
    date: string;
    weekday: number;
}

interface ContributionWeek {
    contributionDays: ContributionDay[];
}

interface ContributionHeatmapProps {
    weeks: ContributionWeek[];
    totalContributions: number;
}

const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({ weeks, totalContributions }) => {
    if (!weeks || weeks.length === 0) return null;


    // Calculate month positions based on actual dates
    const getMonthLabels = () => {
        const labels: { name: string; weekIndex: number }[] = [];
        let lastMonth = -1;
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        weeks.forEach((week, weekIndex) => {
            if (week.contributionDays && week.contributionDays.length > 0) {
                // Use the first day of the week (Sunday) to determine month
                const firstDay = week.contributionDays[0];
                if (firstDay && firstDay.date) {
                    const date = new Date(firstDay.date);
                    const month = date.getMonth();
                    if (month !== lastMonth) {
                        labels.push({ name: monthNames[month], weekIndex });
                        lastMonth = month;
                    }
                }
            }
        });
        
        return labels;
    };

    const monthLabels = getMonthLabels();

    return (
        <div className="contributions-section">
            <h2>{totalContributions.toLocaleString()} contributions in the last year</h2>
            <div className="heatmap-wrapper">
                {/* Day labels */}
                <div className="heatmap-day-labels">
                    <span></span>
                    <span>Mon</span>
                    <span></span>
                    <span>Wed</span>
                    <span></span>
                    <span>Fri</span>
                    <span></span>
                </div>
                
                <div className="heatmap-main">
                    {/* Month Labels */}
                    <div className="heatmap-month-row">
                        {weeks.map((_, weekIndex) => {
                            const monthLabel = monthLabels.find(m => m.weekIndex === weekIndex);
                            return (
                                <span key={weekIndex} className="heatmap-month-cell">
                                    {monthLabel ? monthLabel.name : ''}
                                </span>
                            );
                        })}
                    </div>

                    <div className="heatmap-grid">
                        {weeks.map((week, wIndex) => (
                            <div key={wIndex} className="heatmap-week">
                                {/* Each week should have exactly 7 days */}
                                {week.contributionDays.map((day, dIndex) => (
                                    <div
                                        key={`${wIndex}-${dIndex}`}
                                        className="heatmap-cell"
                                        style={{ 
                                            backgroundColor: day.color === 'transparent' ? 'transparent' : (day.color || '#ebedf0'),
                                            visibility: day.color === 'transparent' ? 'hidden' : 'visible'
                                        }}
                                        title={day.color !== 'transparent' ? `${day.contributionCount} contributions on ${day.date}` : ''}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <div className="heatmap-footer">
                <a href="https://docs.github.com/articles/why-are-my-contributions-not-showing-up-on-my-profile" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   style={{ color: '#64748b', fontSize: '11px', textDecoration: 'none' }}>
                    Learn how we count contributions
                </a>
                <div className="heatmap-legend">
                    <span>Less</span>
                    <div className="legend-cell" style={{ backgroundColor: '#ebedf0' }}></div>
                    <div className="legend-cell" style={{ backgroundColor: '#9be9a8' }}></div>
                    <div className="legend-cell" style={{ backgroundColor: '#40c463' }}></div>
                    <div className="legend-cell" style={{ backgroundColor: '#30a14e' }}></div>
                    <div className="legend-cell" style={{ backgroundColor: '#216e39' }}></div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
};

export default ContributionHeatmap;
