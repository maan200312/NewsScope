import { Link } from "react-router-dom";
import BiasBar from "../common/biasbar";

function Politics({ news = [] }) {

    const politics = news.filter(
        item => item.category?.toLowerCase() === "politics"
    );

    if (politics.length === 0) return null;

    const hero = politics[0];

    const blindspots = politics
        .filter(
            item =>
                item.id !== hero.id &&
                item.bias !== "center"
        )
        .slice(0, 2);

    return (

        <section className="mt-16">

            {/* Heading */}

            <div className="flex justify-between items-center mb-6">

                <h2 className="text-3xl font-bold">
                    Politics News
                </h2>

                <button className="border px-4 py-2 rounded hover:bg-gray-100 transition">
                    Read More
                </button>

            </div>

            {/* Layout */}

            <div className="grid lg:grid-cols-12 gap-8">

                {/* LEFT */}

                <div className="lg:col-span-8">

                    <Link
                        to={`/cluster/${hero.slug}`}
                        className="group block"
                    >

                        <img
                            src={hero.hero_image}
                            alt={hero.main_title}
                            className="w-full h-[420px] object-cover rounded-xl"
                        />

                        <div className="mt-4">

                            <BiasBar
                                score={hero.bias_score}
                            />

                        </div>

                        <h2 className="text-4xl font-bold mt-4 leading-tight group-hover:text-blue-600 transition">

                            {hero.main_title}

                        </h2>

                        <p className="text-gray-500 mt-3">

                            {hero.article_count} Articles • {hero.source_count} Sources

                        </p>

                    </Link>

                </div>

                {/* RIGHT */}

                <div className="lg:col-span-4 space-y-6">

                    {blindspots.map(cluster => (

                        <Link
                            key={cluster.id}
                            to={`/cluster/${cluster.slug}`}
                            className="group block"
                        >

                            <img
                                src={cluster.hero_image}
                                alt={cluster.main_title}
                                className="w-full h-44 object-cover rounded-lg"
                            />

                            <div className="flex items-center gap-2 mt-3">

                                <span className="text-xs text-gray-500">
                                    Blindspot
                                </span>

                                <span
                                    className={`text-xs px-2 py-1 rounded text-white ${
                                        cluster.bias === "left"
                                            ? "bg-red-600"
                                            : "bg-blue-600"
                                    }`}
                                >
                                    {cluster.bias}
                                </span>

                            </div>

                            <h3 className="font-bold text-xl mt-3 leading-7 group-hover:text-blue-600 transition">

                                {cluster.main_title}

                            </h3>

                            <p className="text-sm text-gray-500 mt-2">

                                {cluster.article_count} Articles • {cluster.source_count} Sources

                            </p>

                        </Link>

                    ))}

                </div>

            </div>

        </section>

    );

}

export default Politics;