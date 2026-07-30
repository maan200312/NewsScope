export default function About() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-14">

            <h1 className="text-4xl font-bold mb-8">
                About News Scope            </h1>

            <p className="text-lg text-gray-600 leading-8">
                News Scope is an AI-powered news aggregation platform inspired by
                Ground News.

                Our goal is to help readers compare news from multiple
                publishers, identify media bias, discover blind spots, and
                understand world events from different perspectives.
            </p>

            <div className="mt-12 grid md:grid-cols-3 gap-6">

                <div className="border rounded-xl p-6">

                    <h2 className="font-bold text-xl mb-3">
                        Multi Source
                    </h2>

                    <p>
                        Compare the same story from many publishers.
                    </p>

                </div>

                <div className="border rounded-xl p-6">

                    <h2 className="font-bold text-xl mb-3">
                        AI Clustering
                    </h2>

                    <p>
                        Similar stories are grouped into one cluster.
                    </p>

                </div>

                <div className="border rounded-xl p-6">

                    <h2 className="font-bold text-xl mb-3">
                        Bias Analysis
                    </h2>

                    <p>
                        Understand how different outlets cover the same event.
                    </p>

                </div>

            </div>

        </div>
    );
}