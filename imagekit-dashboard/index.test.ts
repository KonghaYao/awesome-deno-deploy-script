export type ImageKitData = {
    count: number;
    storage_bytes: {
        total: number;
    };
    original_cache_storage_bytes: {
        total: number;
    };
    request: {
        total: number;
        dateWise: {
            labels: Array<string>;
            datasets: Array<{
                fillColor: string;
                data: Array<number>;
            }>;
        };
        pattern: Array<{
            name: string;
            count: number;
        }>;
    };
    bandwidth: {
        total: number;
        dateWise: {
            labels: Array<string>;
            datasets: Array<{
                fillColor: string;
                data: Array<number>;
            }>;
        };
        pattern: Array<{
            name: string;
            count: number;
        }>;
    };
    topImages: {
        bandwidthWise: Array<{
            url: string;
            bandwidth: number;
            views: number;
        }>;
        requestWise: Array<{
            url: string;
            bandwidth: number;
            views: number;
        }>;
    };
    topVideos: {
        bandwidthWise: Array<any>;
        requestWise: Array<any>;
    };
    topOthers: {
        bandwidthWise: Array<{
            url: string;
            bandwidth: number;
            views: number;
        }>;
        requestWise: Array<{
            url: string;
            bandwidth: number;
            views: number;
        }>;
    };
    top404: {
        t404: Array<{
            url: string;
            views: number;
        }>;
    };
    formatWise: Array<{
        name: string;
        bandwidth: number;
        count: number;
    }>;
    referral: {
        items: Array<{
            name: string;
            bandwidth: number;
            count: number;
        }>;
    };
    country: {
        count: number;
        bandwidth: number;
        items: Array<{
            name?: string;
            bandwidth: number;
            count: number;
            code?: string;
        }>;
    };
    transform: {
        count: number;
        bandwidth: number;
        items: Array<{
            name: string;
            bandwidth: number;
            count: number;
        }>;
    };
    videoTransform: {
        count: number;
        bandwidth: number;
        items: Array<any>;
    };
    savings: {
        sav: number;
        size: number;
        savingsTrend: {
            labels: Array<any>;
            datasets: Array<{
                fillColor: string;
                data: Array<any>;
            }>;
        };
    };
    networkDistribution: {};
    statusCodeWise: Array<{
        name: number;
        count: number;
    }>;
    errorCodeWise: Array<{
        name: string;
        count: number;
    }>;
    browserDistribution: Array<{
        name: string;
        count: number;
        bandwidth: number;
    }>;
    topIps: Array<{
        name: string;
        count: number;
        bandwidth: number;
    }>;
    topUserAgent: Array<{
        name: string;
        count: number;
        bandwidth: number;
    }>;
    deviceDistribution: Array<{
        name: string;
        count: number;
        bandwidth: number;
    }>;
    deviceTypeDistribution: Array<{
        name: string;
        count: number;
        bandwidth: number;
    }>;
    resultType: Array<{
        name: string;
        count: number;
        bandwidth: number;
    }>;
    videoProcessingUnits: {
        total: number;
        videoProcessingResolutionData: {
            SD: number;
            HD: number;
            "4K": number;
            "8K": number;
            "16K": number;
        };
        dateWise: Array<{
            date: string;
            duration: {
                SD: number;
                HD: number;
                "4K": number;
                "8K": number;
                "16K": number;
            };
            vpuUsage: {
                SD: number;
                HD: number;
                "4K": number;
                "8K": number;
                "16K": number;
            };
        }>;
    };
    extensionUnits: {
        total: number;
        extensionWiseOperations: {
            "aws-auto-tagging": number;
            "google-auto-tagging": number;
            "remove-bg": number;
        };
        dateWise: Array<any>;
    };
};
