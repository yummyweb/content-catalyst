import "./Home.css"
import Button from "./Button"
import Nav from "./Nav"
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { createClient } from '@supabase/supabase-js'
import axios from "axios";
import { Routes, Route, Outlet, Link } from "react-router-dom";

const supabase = createClient("https://agyuobyahqpmyxfmkwte.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFneXVvYnlhaHFwbXl4Zm1rd3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzc5MTU4NzcsImV4cCI6MTk5MzQ5MTg3N30.2tO9H3FSdBCARzpvoYT1jKUOqakp2gIS6kIi-Q18Tug")

function Home() {
    const { user, loginWithRedirect, isAuthenticated } = useAuth0();
    const [channelId, setChannelId] = useState("")
    const [accountAlrCreated, setAccountAlrCreated] = useState(false)
    const [ownsChannel, setOwnsChannel] = useState(true)

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
                    if (data.length !== 0) {
                        setAccountAlrCreated(true)
                    }
                }
            }
            check()
        }
    }, [isAuthenticated])

    const createCreator = async () => {
        if (channelId) {
            const res = await axios.get(`https://cors-anywhere.herokuapp.com/https://aiotube.deta.dev/channel/${channelId}/info`, {
                headers: {
                    "Accept": "application/json",
                    "Origin": "http://localhost:3001"
                }
            })
            let viewsPoints = 0
            if (res.data.views !== null) {
                viewsPoints = parseFloat(res.data.views.replace(/,/g, '')) * 0.1
            }

            const subsPoints = parseFloat(res.data.subscribers.replace(/,/g, '')) * 0.3
            let totalPoints = viewsPoints + subsPoints
            if (res.data.description !== "None") {
                totalPoints = totalPoints + 10
            }
            if (res.data.banner) {
                totalPoints = totalPoints + 5
            }
            console.log(totalPoints)
            if (user.name === res.data.name || user.given_name + " " + user.family_name === res.data.name) {
                const { error } = await supabase.from("Creator").insert({
                    youtube_channel: channelId,
                    points: Math.round(totalPoints),
                    email: user.email
                })
                if (error) {
                    console.log(error)
                }
                setOwnsChannel(true)
                console.log("user owns channel")
            }
            else {
                setOwnsChannel(false)
            }
        }
    }

    return (
        <>
            <Nav />
            <div className="hero">
                <p>Curate content like a pro</p>
                <p>with <strong>Content Catalyst</strong></p>
            </div>
            <div className="center-align">
                {isAuthenticated ? (
                    <>
                        {!accountAlrCreated ?
                            (
                                <div className="journey-wrapper">
                                    <input value={channelId} onChange={e => setChannelId(e.target.value)} className="input" placeholder="Enter YouTube Channel ID" />
                                    <Button onClick={() => createCreator()} text="Start Journey" />
                                    {!ownsChannel ? <p style={{ color: 'red' }}>Currently logged in user does not own channel</p> : null}
                                </div>
                            )
                            : <Link to="/content" style={{ fontSize: 20, color: "white" }}>Go to your content</Link>}
                    </>
                ) : <Button onClick={() => loginWithRedirect()} text="Login" />}
            </div>
        </>
    )
}

export default Home