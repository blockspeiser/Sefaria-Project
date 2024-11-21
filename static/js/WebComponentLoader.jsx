import React, { useState } from 'react';

function WebComponentLoader(props) {
  const [link, setLink] = useState('');
  const [loaded, setLoaded] = useState(false);
  const sref = props.sref;

  const repoToRawLink = (link) => {
    const repo = link.split('github.com/')[1].split('/');
    const dateTimeStamp = new Date().getTime();
    return `https://${repo[0]}.github.io/${repo[1]}/plugin.js?rand=${dateTimeStamp}`
  }

  let script = null;
    
  const handleClick = () => {
    if (script) {
      document.head.removeChild(script);
      setLoaded(false);
    }
    if (link) {
      script = document.createElement('script');
      script.src = repoToRawLink(link);
      script.async = true;
      script.onload = () => {
        setLoaded(true);
      };
      document.head.appendChild(script);
    }
  };

  if (loaded) {
    return (
            <div>
                <button onClick={handleClick}>Reload Plugin</button>
                <sefaria-plugin sref={sref} />
            </div>
        );
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Enter script link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />
      <button onClick={handleClick}>Pull</button>
    </div>
  );
}

export default WebComponentLoader;
