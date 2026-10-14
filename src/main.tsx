import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import './feedback-fix.css';
const feedbackFix = document.createElement('style');
feedbackFix.textContent = '.feedback>.feedback-content{flex:1 1 auto!important;width:auto!important;height:auto!important;min-width:0!important;border-radius:0!important;display:block!important;place-items:unset!important;font-size:inherit!important;font-weight:inherit!important}';
document.head.appendChild(feedbackFix);
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);

