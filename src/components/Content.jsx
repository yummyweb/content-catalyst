import "./Content.css"
import Nav from "./Nav"
import { useAuth0 } from "@auth0/auth0-react";
import VideoThumbnail from "./VideoThumbnail";
import { useEffect, useState } from "react";
import { createClient } from '@supabase/supabase-js'
import axios from "axios";

const supabase = createClient("https://agyuobyahqpmyxfmkwte.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFneXVvYnlhaHFwbXl4Zm1rd3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzc5MTU4NzcsImV4cCI6MTk5MzQ5MTg3N30.2tO9H3FSdBCARzpvoYT1jKUOqakp2gIS6kIi-Q18Tug")

// Beginner: Less than 100 points
// Amateur Creator: 100 <= POINTS <= 200

function Content() {
    const { user, isAuthenticated } = useAuth0();
    const [accountData, setAccountData] = useState(null)
    const [videos, setVideos] = useState(null)

    const calculatePoints = async (channelId) => {
        const res = await axios.get(`https://cors-anywhere.herokuapp.com/https://aiotube.deta.dev/channel/${channelId}/info`, {
            headers: {
                "Accept": "application/json",
                "Origin": "http://localhost:3001"
            }
        })
        const viewsPoints = parseFloat(res.data.views.replace(/,/g, '')) * 0.1

        const subsPoints = parseFloat(res.data.subscribers.replace(/,/g, '')) * 0.3
        let totalPoints = viewsPoints + subsPoints
        if (res.data.description !== "None") {
            totalPoints = totalPoints + 10
        }
        if (res.data.banner) {
            totalPoints = totalPoints + 5
        }

        return totalPoints
    }

    useEffect(() => {
        if (isAuthenticated) {
            const check = async () => {
                const { data, error } = await supabase
                    .from('Creator')
                    .select()
                    .eq('email', user.email)
                if (error) {
                    console.log(error)
                }
                else {
                    console.log(data)
                    setAccountData(data[0])
                }
            }
            check()
        }
    }, [isAuthenticated])

    useEffect(() => {
        if (accountData && !videos) {
            const getStuff = () => {
                const res = axios.get(`https://cors-anywhere.herokuapp.com/https://aiotube.deta.dev/channel/${accountData.youtube_channel}/uploads`, {
                    headers: {
                        "Accept": "application/json",
                        "Origin": "http://localhost:3001"
                    }
                })
                res.then(data => {
                    if (!videos) {
                        const vids = data.data.slice(0, 3)
                        const result = []
                        for (let i = 0; i < vids.length; i++) {
                            const vid = vids[i]
                            const _res = axios.get(`https://cors-anywhere.herokuapp.com/https://aiotube.deta.dev/video/${vid}`, {
                                headers: {
                                    "Accept": "application/json",
                                }
                            })
                            _res.then(moreData => {
                                setVideos(prev => [...prev, moreData.data])
                            })
                        }
                        if (!videos) {
                            setVideos(result)
                        }
                    }
                    else {
                        console.log(videos)
                    }
                })
            }
            getStuff()
        }
    }, [accountData])

    useEffect(() => {
        if (accountData) {
            calculatePoints(accountData.youtube_channel)
            .then(points => {
                console.log(Math.round(points))
                console.log(Math.round(points) - accountData.points)
                if (Math.round(points) - accountData.points !== 0) {
                    console.log("updating")
                    const update = async () => await supabase.from("Creator").update({
                        points: Math.round(points),
                    }).eq("email", accountData.email)
                    update()
                }
            })
        }
    }, [accountData])

    const getNextReward = () => {
        if (accountData) {
            if (accountData.points <= 100) {
                return ["Beginner", 100]
            }
            else if (accountData.points <= 200) {
                return ["Amateur Creator", 200]
            }
            else if (accountData.points <= 500) {
                return ["Rise to Fame", 500]
            }
            else if (accountData.points <= 2000) {
                return ["Viral Fever", 2000]
            }
        }
        else {
            return "Loading..."
        }
    }

    return (
        <>
            <Nav />
            {isAuthenticated ? (<><div className="thumbnail-container">
                <h2>Latest Videos</h2>
                <div className="wrapper">{videos ? videos.map(v => <VideoThumbnail viewCount={v.views} img={v.thumbnails[0].url} />) : "Loading..."}</div>
            </div>
                <div className="reward">
                    <div className="next-reward-wrapper">
                        <p className="next-reward">Tier: Graphite</p>
                    </div>
                    <div className="next-reward-wrapper">
                        <p className="next-reward">Next Rank: {getNextReward()[0]}</p>
                    </div>
                    <div className="next-reward-wrapper">
                        <div className="progress-bar">
                            {accountData ? <div style={{ width: `${100 * (accountData.points / getNextReward()[1])}%` }} className="filled"></div> : null}
                        </div>
                    </div>
                    <div className="next-reward-wrapper">
                        <p className="next-reward">Total Points: {accountData ? accountData.points : 0}</p>
                    </div>
                </div></>) : null}
        </>
    )
}

export default Content