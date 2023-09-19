import React, { useEffect, useState } from 'react'
import Papa from 'papaparse'

const BlogPostPreview = ({ post }) => {
    const [ showContent, setShowContent ] = useState(false)
    console.log(post)
    return (<div className="mb-2 border-2 border-black p-4">
    <div className="grid grid-cols-8 mb-2 gap-2">
        <div className="col-span-3">
            <img className="h-56 w-full object-cover" src={ post.image.src } />
        </div>
        <div className="col-span-5">
            <h3 className="font-bold">{ post.title }</h3>
            <div className="grid grid-cols-4">
                {/* Post Author */}
                <div className="col-span-1">
                    <p>Author</p>
                </div>
                <div className="col-span-3">
                    <p>{ post.author }</p>
                </div>

                {/* Post Date */}
                <div className="col-span-1">
                    <p>Date</p>
                </div>
                <div className="col-span-3">
                    <p>{ post.date }</p>
                </div>

                {/* Post Tags */}
                <div className="col-span-1">
                    <p>Tags</p>
                </div>
                <div className="col-span-3">
                    <p>{ post.tags }</p>
                </div>

                {/* Post Excerpt */}
                <div className="col-span-1">
                    <p>Post Excerpt</p>
                </div>
                <div className="col-span-3">
                    <div dangerouslySetInnerHTML={{ __html: post.excerpt }}></div>
                </div>

                {/* Post Slug */}
                <div className="col-span-1">
                    <p>Post Slug</p>
                </div>
                <div className="col-span-3">
                    <p>{ post.slug }</p>
                </div>
            </div>
        </div>
    </div>
    
    <div className="">
        <button className="font-bold" onClick={ () => { setShowContent( !showContent ) } }>Preview Content</button>
        <div className={` ${ showContent ? 'block' : 'hidden' } mt-2c`} dangerouslySetInnerHTML={{ __html: post.body_html }}></div>
    </div>
</div>

    )
}
export default function ShopifyBlogApi() {
    let [ fetchingPosts, setFetchingPosts ] = useState(false)
    let [ postMethod, setPostMethod ] = useState("wordpress")
    let [ wordpressUrl, setWordpressUrl ] = useState("")
    let [ postsData, setPostsData ] = useState([])
    let [ showCSVInstructions, setShowCSVInstructions ] = useState(true)
    // Step One
    let [ blogData, setBlogData ] = useState([])
    let [ selectedBlog, setSelectedBlog ] = useState([])

    // Step Two
    let [ parsedData, setParsedData ] = useState([]) 
    let [ awaitingResponse, setAwaitingResponse ] = useState(false)
    
    // Step One
    useEffect(() => {
        try {
            fetch("/shopify/blogs/get-all-blogs", {
                method: "GET"
            })
            .then(res => res.json())
            .then(data => {
                setBlogData(data.blogs)
            })
        } catch {
            console.log(err)
        }
    }, [])

    const togglePostMethod = (method) => {
        setPostsData([])
        setPostMethod(method)
    }

    const handleBlogClick = (blog) => {
        setSelectedBlog(blog)
    }

    // Step Two
    const handleFileChange = (e) => {
        Papa.parse(e.target.files[0], {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                let posts = []
                for (let i = 0; i < results.data.length; i++) {
                    console.log(results.data[i])
                    let post = {
                        "title": results.data[i]["Title"],
                        "date": results.data[i]["Date"],
                        "author": results.data[i]["Author First Name"] + " " + results.data[i]["Author Last Name"],
                        "body_html": results.data[i]["Content"],
                        "published": false,
                        "excerpt": results.data[i]["Excerpt"],
                        "image": {
                            "src": results.data[i]["Image Featured"]
                        },
                        "tags": results.data[i]["Tags"].split("|").join(", "),
                        "slug": results.data[i]["Slug"]
                    }
                    posts.push(post)
                    if (i === results.data.length - 1) {
                        setPostsData(posts)
                    }
                }
                setParsedData(results.data)
            }
        })
    }

    const createBlogPosts = async () => {
        setAwaitingResponse(true)
        try {
            fetch("/shopify/blogs/create-article", {
                method: "POST",
                body: JSON.stringify({
                    articles: postsData,
                    blog: selectedBlog
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(res => res.json())
                .then(data => {
                    setAwaitingResponse(false)
                })
        } catch (err) {
            console.log(err)
        }
    }

    const getWordpressPosts = async () => {
        setFetchingPosts(true)
        try {
            fetch("/wordpress/blogs/get-all-posts", {
                method: "POST",
                body: JSON.stringify({
                    url: wordpressUrl
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(res => res.json())
                .then(data => {
                    setFetchingPosts(false)
                    setPostsData(data.posts)
                })
        } catch (err) {
            console.log(err)
        }
    }
    return (<>
        <div className="max-w-5xl m-auto">
            <div className='mb-2'>
                <h1 className="text-2xl font-bold text-center">Migrate Posts to Shopify</h1>
            </div>
            <div className="mb-2 flex gap-2 flex-col p-4 border-2 border-black">
                <div>
                    <p className="m-0 font-bold">Select Post Method</p>
                </div>
                <div className="mb-2 flex gap-2">
                    <button className="w-60 hover:cursor-pointer text-white bg-black py-2 px-4 border-2 border-black" onClick={ () => togglePostMethod('wordpress') }>
                        Wordpress URL
                    </button>
                    <button className="w-60 hover:cursor-pointer text-white bg-black py-2 px-4 border-2 border-black" onClick={ () => togglePostMethod('csv') }>
                        Upload CSV
                    </button>
                </div>
            </div>
            {/* Get Wordpress Posts */}
            {
                postMethod === 'wordpress' &&
                <div className="mb-2 flex gap-2 flex-col p-4 border-2 border-black">
                    <div>   
                        <p className="m-0 font-bold">Retrieve Posts From Wordpress</p>
                    </div>
                    <input className="border-2 border-black p-2" type="text" placeholder="Wordpress Website URL (ex. https://example.com)" value={ wordpressUrl } onChange={ (event) => setWordpressUrl(event.target.value) }></input>
                    <button className="w-60 hover:cursor-pointer text-white bg-black py-2 px-4 border-2 border-black" onClick={ getWordpressPosts }>
                        { fetchingPosts ? 'Retreiving Posts...' : 'Get Posts' }
                    </button>
                </div>
            }
            {
                postMethod === 'csv' &&
                <div className="mb-2 flex gap-2 flex-col p-4 border-2 border-black">
                    <div>   
                        <p className="m-0 font-bold">Upload Blog Posts</p>
                    </div>
                    <div className="flex flex-col mb-2 gap-2">
                        <input 
                            type="file" 
                            name="file"
                            accept=".csv"
                            onChange={ handleFileChange }
                        />
                    </div>
                </div>
            }
                        
                        
            <div className="">
                {
                    postsData.map((data, index) => {
                        return <BlogPostPreview post={ data } key={ index } />
                    })
                }
            </div>

            {/* Step One: Select Blog */}
            <div>
                {/* Select Blog */}
                <div className="mb-2 flex gap-2 flex-col p-4 border-2 border-black">
                    <div>   
                        <p className="m-0 font-bold">Available Blogs</p>
                    </div>
                    <div className="mb-2 flex gap-2">
                        { blogData ? 
                            blogData.map((blog, index) => {
                                return <div className="hover:cursor-pointer py-2 px-4 border-2 border-black" key={ index } onClick={ () => handleBlogClick(blog) }>
                                    { blog.title }
                                </div>
                            })
                            : <p>Hold On</p>
                        }
                    </div>
                </div>
                {/* Display Selected Blog */}
                <div className="mb-2 gap-2 p-4 border-2 border-black">
                    <p className="m-0 font-bold">Selected Blog</p>
                    <p>Title: { selectedBlog.title }</p>
                    <p>Id: { selectedBlog.id }</p>
                </div>
            </div>

            <div className="mb-2 flex gap-2 flex-col p-4 border-2 border-black">
                <div>
                    <p className="m-0 font-bold">Upload Posts</p>
                </div>
                <div className="mb-2 flex gap-2">
                { awaitingResponse ?
                    <p>Loading up the blog posts...</p>
                    : <button 
                        className="w-60 hover:cursor-pointer text-white bg-black py-2 px-4 border-2 border-black"
                        onClick={ createBlogPosts }
                    >
                        Upload Blog Posts!
                    </button>
                }
                </div>
            </div>


        </div>
    </>)
}