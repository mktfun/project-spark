import { LucideIcon, Bot, Server, Database, Box } from 'lucide-react';

export interface ServiceStack {
    id: string;
    name: string;
    description: string;
    icon: LucideIcon;
    services: string[]; // List of container names or substrings to match
}

export const STACKS: ServiceStack[] = [
    {
        id: 'automation',
        name: 'Automation Bots',
        description: 'Workflow engines and chat bots',
        icon: Bot,
        services: ['n8n', 'evolution', 'chatwoot', 'typebot', 'whatsapp'],
    },
    {
        id: 'core',
        name: 'System Core',
        description: 'Command Center infrastructure',
        icon: Server,
        services: ['command_center_backend', 'command_center_frontend', 'command_center_nginx', 'command-center'],
    },
    {
        id: 'data',
        name: 'Data & Infra',
        description: 'Databases and message queues',
        icon: Database,
        services: ['postgres', 'redis', 'minio', 'mongo'],
    },
];

export const UNKNOWN_STACK: ServiceStack = {
    id: 'other',
    name: 'Other Services',
    description: 'Uncategorized containers',
    icon: Box,
    services: [],
};

export const getStackForContainer = (containerName: string): ServiceStack => {
    const lowerName = containerName.toLowerCase();
    for (const stack of STACKS) {
        if (stack.services.some(s => lowerName.includes(s))) {
            return stack;
        }
    }
    return UNKNOWN_STACK;
};
